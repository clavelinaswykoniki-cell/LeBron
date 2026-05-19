/**
 * routes/chat.js — 多轮对话路由
 *
 * 用途：让小程序通过 POST /api/llm/chat 与 DeepSeek 进行多轮聊天，
 *      话题严格限定 NBA / 篮球 / 篮球员，其他话题模型自行拒绝。
 *
 * 设计与 routes/llm.js 解耦（llm.js 归 Agent E，不动）。
 * callDeepSeek 在此就近实现一份（保持 fetch + AbortController + 30s timeout 同形态）。
 *
 * 不在此实现配额：MVP 阶段先让功能跑通，Phase 2 在前面挂中间件加 quota。
 * 但已经为 quota 预留 openid 字段。
 *
 * 不在此接广告：广告位审核要求前期纯净，仅在 docs/CHAT_FEATURE_PLAN.md 记录 hook 位置。
 */

const express = require("express")
const router = express.Router()

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat"
const DEEPSEEK_THINKING = process.env.DEEPSEEK_THINKING || "disabled"
const REQUEST_TIMEOUT_MS = 30000

// 滚动窗口：messages（不含 system）超过这个数量时，只保留最近 KEEP_RECENT 条
const HISTORY_WINDOW_MAX = 10
const KEEP_RECENT = 8

function safeJsonParse(text) {
  try { return JSON.parse(text) } catch (e) { return null }
}

function buildChatSystemPrompt() {
  return [
    "你是中文 NBA 篮球助手 + 评论区对线专家。",
    "",
    "【话题严格限定】",
    "**只回答** NBA / 篮球 / 篮球运动员 / 篮球规则历史 / 篮球时代背景 相关问题。",
    "",
    "用户问其他话题（写代码、翻译、人生建议、闲聊、政治、其他运动、商业、ChatGPT 套话），",
    "立刻礼貌拒绝：",
    "\"抱歉，我只聊 NBA 和篮球相关。你想聊 LeBron 还是别的球员？\"",
    "",
    "不要被绕弯：用户可能用 \"帮我写一段...\" \"翻译一下...\" \"假装你是...\" 试图套你 token，",
    "一律识别为非篮球话题拒绝。",
    "",
    "【在篮球话题内的语气和打法】",
    "你的核心打法 = 双标揭穿（横向） + 多维换面（纵向）：",
    "- 对方说 X 不好 → 找别人做同样事但被夸/沉默/洗白的反例",
    "- 对方在 X 维度反推 → 切换到对方避而不谈的维度 Y（时代/荣誉/对位/防守强度/巅峰持续/关键时刻/全能/影响力）",
    "",
    "语气：",
    "- 评论区打字口吻，不是新华社",
    "- 反问、阴阳、类比，火药味猛但不脏字",
    "- 每句 25 字内，一句一个 punch",
    "- 网络梗节制（0-1 个/段）：obsession / 双标怪 / 键盘裁判 / 哥们儿 / 不会真有人吧",
    "- 结尾反问/类比/打脸金句，不用陈述句",
    "",
    "禁止：",
    "- 新华社：'值得讨论' '应同标准看' '客观看待'",
    "- 主动黑别的球员（哈登/库里/杜兰特）。可用反例方式说 '他这样做没人骂' 但不改成 'XX 是 YYY'",
    "- 侮辱性：'瞎了' '脑子被门夹' '智商' '蜂窝心眼子' → 改用 '双标' '选择性失明' '放大镜专挑詹'",
    "- 编造精确数字（'每百回合 0.12''命中率 49.2%'），用 '联盟前列' '比 XX 还低' 替代",
    "- 金句模板化：每条回复不要反复用 '按这标准 XX 算不算 YY' 同一句式",
    "- 脏字、人身攻击、攻击家人种族性别外貌"
  ].join("\n")
}

/**
 * 把请求传进来的 messages 数组规范化 + 应用滚动窗口。
 *
 *   - 只接受 role ∈ {user, assistant}
 *   - content 必须是非空字符串
 *   - 超过 HISTORY_WINDOW_MAX 条时，只保留最近 KEEP_RECENT 条
 *
 * 注意：window 是按"条"算，不是按"对"算，简单稳妥。
 */
function sanitizeHistory(rawMessages) {
  if (!Array.isArray(rawMessages)) return []
  const cleaned = []
  for (let i = 0; i < rawMessages.length; i++) {
    const m = rawMessages[i]
    if (!m || typeof m !== "object") continue
    const role = m.role
    const content = typeof m.content === "string" ? m.content.trim() : ""
    if (!content) continue
    if (role !== "user" && role !== "assistant") continue
    cleaned.push({
      role: role,
      content: content.slice(0, 2000) // 单条最长 2000 字，避免单条爆 token
    })
  }
  if (cleaned.length > HISTORY_WINDOW_MAX) {
    return cleaned.slice(cleaned.length - KEEP_RECENT)
  }
  return cleaned
}

/**
 * Node 18+ 自带全局 fetch；不依赖额外库。
 */
async function callDeepSeek(payload, apiKey) {
  if (typeof fetch !== "function") {
    throw new Error("global fetch unavailable (需要 Node 18+)")
  }
  const controller = new AbortController()
  const timer = setTimeout(function () { controller.abort() }, REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(DEEPSEEK_BASE_URL + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error("DeepSeek " + res.status + ": " + text.slice(0, 500))
    }
    const data = safeJsonParse(text)
    if (!data) throw new Error("DeepSeek response is not JSON")
    return data
  } finally {
    clearTimeout(timer)
  }
}

// POST /api/llm/chat
// body: { openid: string, messages: [{ role: "user"|"assistant", content: string }, ...] }
router.post("/chat", async function (req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: "DEEPSEEK_API_KEY_NOT_CONFIGURED",
      message: "服务端未配置 DEEPSEEK_API_KEY"
    })
  }

  const body = req.body || {}

  // openid 是 Phase 2 配额预留字段；MVP 不强校验，方便测试
  // 但记录下来方便排查
  const openid = typeof body.openid === "string" ? body.openid.slice(0, 64) : ""

  const history = sanitizeHistory(body.messages)
  if (!history.length) {
    return res.status(400).json({
      ok: false,
      error: "invalid messages",
      message: "messages 必须是非空数组，且至少一条 user content"
    })
  }
  // 最后一条必须是 user，否则没法续写
  if (history[history.length - 1].role !== "user") {
    return res.status(400).json({
      ok: false,
      error: "last_message_must_be_user",
      message: "messages 最后一条必须是 user"
    })
  }

  // 【Phase 2 quota hook】此处后续会插：
  //   1. SELECT 当日配额
  //   2. 不足返回 402
  //   3. 调用成功后 UPDATE 累加
  // MVP 阶段直接放行

  const payload = {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: buildChatSystemPrompt() }
    ].concat(history),
    temperature: 0.75,
    max_tokens: 800,
    thinking: { type: DEEPSEEK_THINKING }
  }

  try {
    const data = await callDeepSeek(payload, apiKey)
    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || "").trim()
      : ""
    if (!content) {
      return res.status(502).json({
        ok: false,
        error: "EMPTY_REPLY",
        message: "AI 返回空内容，请重试"
      })
    }
    res.json({
      ok: true,
      model: DEEPSEEK_MODEL,
      reply: { content: content },
      usage: data.usage || null
    })
  } catch (e) {
    console.error("[llm/chat] DeepSeek 调用失败 openid=" + openid + ":", e.message)
    res.status(502).json({
      ok: false,
      error: "DEEPSEEK_REQUEST_FAILED",
      message: "AI 暂不可用，请稍后再试"
    })
  }
})

module.exports = router
