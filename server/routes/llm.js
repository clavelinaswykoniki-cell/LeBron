/**
 * routes/llm.js — DeepSeek 代理路由
 *
 * 用途：让小程序通过 POST /api/llm/enhance 调 DeepSeek，
 *      API key 只在 server/.env，永不出现在小程序前端。
 *
 * 移植自 cloudfunctions/generateReply/index.js（保留 prompt 不变）。
 */

const express = require("express")
const router = express.Router()

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"
const DEEPSEEK_THINKING = process.env.DEEPSEEK_THINKING || "disabled"
const REQUEST_TIMEOUT_MS = 30000

function safeJsonParse(text) {
  try { return JSON.parse(text) } catch (e) { return null }
}

function pickCardFields(card) {
  if (!card || typeof card !== "object") return {}
  return {
    id: card.id,
    category: card.category,
    claim: card.claim,
    valid_part: card.valid_part,
    logic_flaw: card.logic_flaw,
    comparison: card.comparison,
    facts: Array.isArray(card.facts) ? card.facts.slice(0, 5) : [],
    short_reply: card.short_reply,
    long_reply: card.long_reply,
    one_liner: card.one_liner,
    video_script: card.video_script,
    tags: Array.isArray(card.tags) ? card.tags.slice(0, 8) : []
  }
}

function buildSystemPrompt() {
  return [
    "你是\"詹姆斯黑粉观点反驳器\"的中文回复生成模型。",
    "核心立场：詹姆斯不是完美球员，但至少是 NBA 历史第二。",
    "反驳方法：承认可承认事实，拆逻辑漏洞，做同标准横向对比。",
    "语言风格：强硬、直接、适合评论区和短视频口播，但只围绕篮球观点。",
    "禁止：造谣、编造数据、人身攻击、攻击球员家人和私生活、辱骂用户。",
    "如果资料不足，必须提示需要核对事实，不要硬编。",
    "只输出 JSON，不要输出 Markdown，不要输出解释。"
  ].join("\n")
}

function buildUserPrompt(body) {
  const userQuery = String(body.userQuery || "").slice(0, 500)
  const matchedCard = pickCardFields(body.matchedCard || {})
  const corePosition = String(body.corePosition || "詹姆斯不是完美球员，但至少是 NBA 历史第二。").slice(0, 500)

  return [
    "用户输入：" + userQuery,
    "核心立场：" + corePosition,
    "命中的本地反驳卡：" + JSON.stringify(matchedCard),
    "请基于本地反驳卡改写并增强回复。",
    "必须返回如下 JSON 字段：",
    JSON.stringify({
      short_reply: "适合直接复制到评论区的短回复",
      long_reply: "事实 + 逻辑 + 同标准对比的完整回复",
      one_liner: "一句话反击",
      video_script: "适合短视频口播的版本"
    })
  ].join("\n")
}

function normalizeReply(content) {
  const parsed = typeof content === "string" ? safeJsonParse(content) : content
  if (!parsed || typeof parsed !== "object") {
    throw new Error("DeepSeek response is not valid JSON")
  }
  return {
    short_reply: String(parsed.short_reply || "").trim(),
    long_reply: String(parsed.long_reply || "").trim(),
    one_liner: String(parsed.one_liner || "").trim(),
    video_script: String(parsed.video_script || "").trim()
  }
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

// POST /api/llm/enhance
// body: { userQuery: string, matchedCard: object, corePosition?: string }
router.post("/enhance", async function (req, res, next) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: "DEEPSEEK_API_KEY_NOT_CONFIGURED",
      message: "服务端未配置 DEEPSEEK_API_KEY"
    })
  }

  const body = req.body || {}
  if (typeof body.userQuery !== "string" || !body.userQuery.trim()) {
    return res.status(400).json({ ok: false, error: "invalid userQuery" })
  }

  const payload = {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(body) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1200,
    thinking: { type: DEEPSEEK_THINKING }
  }

  try {
    const data = await callDeepSeek(payload, apiKey)
    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : ""
    const reply = normalizeReply(content)
    res.json({
      ok: true,
      model: DEEPSEEK_MODEL,
      reply: reply,
      usage: data.usage || null
    })
  } catch (e) {
    console.error("[llm/enhance] DeepSeek 调用失败:", e.message)
    res.status(502).json({
      ok: false,
      error: "DEEPSEEK_REQUEST_FAILED",
      message: e.message
    })
  }
})

// GET /api/llm/health — 不消耗 token 的健康检查
router.get("/health", function (req, res) {
  res.json({
    ok: true,
    configured: !!process.env.DEEPSEEK_API_KEY,
    model: DEEPSEEK_MODEL,
    base_url: DEEPSEEK_BASE_URL
  })
})

module.exports = router
