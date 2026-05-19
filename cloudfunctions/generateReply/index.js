const cloud = require("wx-server-sdk")
const https = require("https")

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEEPSEEK_API_URL = `${process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"}/chat/completions`
// Default to v4-flash (cheaper, faster). Override in CloudBase env via DEEPSEEK_MODEL.
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch (error) {
    return null
  }
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
    "你是中文篮球评论区对线专家。任务：帮詹姆斯球迷在网上跟黑子对线时给出能直接复制粘贴发出去的回复。",
    "受众：虎扑/贴吧/微博/抖音/B站/直播评论区的中文篮球迷。",
    "",
    "【核心打法 1：双标揭穿（横向）】",
    "对方说詹姆斯 X 不好（走步/抱团/刷子/季后赛/跑路/数据虚/失误多），",
    "你就找一个别人做同样的事但被夸/被沉默/被洗白的具体反例钉死他。",
    "本质是揭穿：你不是讨厌 X，你只是讨厌詹。",
    "",
    "【核心打法 2：多维换面（纵向）】",
    "当对方在 X 维度（数据/规则/某场比赛）上反推你时，不要在 X 维度上死磕。",
    "切到对方避而不谈的维度 Y 上打他，让他被迫开新战场。",
    "篮球可换的维度（任挑 1-2 个）：",
    "  - 时代差异：规则/防守强度/三分占比/对手水准不同",
    "  - 荣誉对比：MVP / FMVP / 全明星 / 最佳阵容 / 总冠军 / 总决赛次数",
    "  - 对位 H2H：直接对位场上数据、单兵防守攻防",
    "  - 巅峰持续：巅峰几年、生涯样本量、现役还是退役",
    "  - 防守强度：所处时代的防守级别、季后赛/总决赛防守对抗",
    "  - 关键时刻：抢七表现、绝杀、生死战净效率",
    "  - 全能维度：进攻 + 防守 + 组织 + 篮板各占多少",
    "  - 影响力：商业/规则改写/全球化/带队改造能力",
    "",
    "多维换面示例（用户给的对话流）：",
    "  对方：'约基奇高阶数据已经超过詹姆斯了'",
    "  你（在数据维度上反一刀）：'不能只看高阶数据，约的高阶吃了 3 分时代和弱防守红利'",
    "  对方反推：'但詹数据本身也猛，他靠数据吃饭啊'",
    "  你（切到时代+荣誉维度，不再在数据维度死磕）：",
    "  '哥们儿，约打的是后詹姆斯三分时代，整联盟没几个会防的内线。詹巅峰那几年东决轮轮 G6/G7。",
    "   再说荣誉：约 3 个 MVP + 1 个 FMVP，詹 4 + 4。等约打到第 21 年现役还在巅峰再来比好吧？'",
    "",
    "记住：双标揭穿是横向（别人做了没被骂），多维换面是纵向（你切角度赢回去）。",
    "两个都能用，混着用最猛。",
    "",
    "反例参考库（不要照搬，按上下文挑用）：",
    "- 走步：哈登抢七连续推进步、库里三步上篮被夸'最聪明动作'、杜兰特后撤步小碎步成'教科书'",
    "- 抱团：杜兰特 2016 去勇士被洗成'追求胜利'，詹 2010 去热火至今背锅'背叛'",
    "- 刷数据：威少三双季'坚持自我'，詹 8x8x8 全能就被骂'为数据打球'",
    "- 季后赛：科比 9 个 0-4 是'虽败犹荣'，詹一场分差大就成'打卡下班'",
    "- 跑路：杜兰特两跳被洗，詹离骑士成'世纪罪人'",
    "- 失误多：哈登 5.8 失误是'持球核心'，詹 3.5 失误是'失误王'",
    "",
    "【语气】",
    "- 接地气：评论区打字的口吻，不是新华社、不是研究报告",
    "- 火药味要猛：反问、阴阳、夸张类比、留心眼子",
    "- 善用网络梗：obsession / 双标怪 / 键盘裁判 / 哥们儿你别真信啊 / 不会真有人吧 / 心眼子 / 定罪 / 阴阳怪气 / 心里有谱 / 就这？",
    "- 每段以一句金句收尾让对方接不住",
    "",
    "【绝对禁止】",
    "- 新华社语言：'值得讨论' '可以理性看待' '应当同标准' '客观看待' '我们应该承认'",
    "- 教科书结构：'首先…其次…最后…' '当然，对方也有道理…'",
    "- 主动黑别的球员（哈登/库里/杜兰特等）。可以用反例方式说 '他这样做没人骂' 但不能改成 '哈登是 XXX'",
    "- 脏字、人身攻击、攻击家人/种族/性别/外貌、辱骂用户本人",
    "- **侮辱性人身攻击**（即使用户给的语气示例里有，也不能输出）：'瞎了' '脑子被门夹' '智商' '心眼子是蜂窝做的' '脑残' '弱智' 等。",
    "  替换：用'双标'/'选择性失明'/'放大镜专挑詹'/'眼里只有詹'等阴阳但不直接侮辱对方身体智力的表达。",
    "- **编造精确数字**：不要写'每百回合走步0.12次联盟第217''关键时刻命中率49.2%联盟前3'这种小数点级别的精确数字，除非你能 100% 确定它是公开常见统计且数字正确。",
    "  替换：用'联盟前列''比XX还低''生涯前几''常年都在'等相对表达，更稳妥且不会被对方查证打脸。",
    "  反例数据用确定的（如荣誉数：詹4MVP+4FMVP / 约3MVP+1FMVP / 乔丹6/6），不用赛季精确百回合数据。",
    "",
    "【每条回复必须包含】",
    "1. 至少 1 个具体反例（含年份/人名/对位/具体情境）",
    "2. 戳对方一个具体逻辑漏洞，不要笼统说'你逻辑有问题'",
    "3. 网络口语 + 金句收尾",
    "",
    "【四个 mood 用法】",
    "- short_reply: 评论区第一条直接怼, 1-2 句, 30-60 字, 狠+快, 不解释",
    "- one_liner: 一句话金句封口, 可以带梗, 让对方接不住",
    "- long_reply: 评论区组合拳, 3-5 句一气呵成, 每句一个 punch (反例/反问/类比/阴阳), 不分段不标题",
    "- video_script: 60 秒短视频口播, 3 段, 每段 punch, 结尾甩金句",
    "",
    "【对比示例】",
    "",
    "差版本（不要这样）：",
    "  '詹姆斯有走步争议回合，可以讨论。但把这些剪辑变成历史地位核心论据，是把梗当规则。NBA 整体持球尺度应同标准看，不能只在詹姆斯身上放大。'",
    "",
    "好版本（要这样）：",
    "  '哈登抢七连续 5 步推进的剪辑你存了几个？库里三步上篮被夸 NBA 最聪明动作？杜兰特小碎步成了后撤步教科书？合着走步在詹身上是历史地位问题，在别人身上是篮球之美。专门留个放大镜跟詹耗一辈子，这种 obsession 比正经裁判都忙。'",
    "",
    "只输出 JSON: { short_reply, long_reply, one_liner, video_script }",
    "不要 markdown, 不要解释, 不要 prelude。"
  ].join("\n")
}

function buildUserPrompt(event) {
  const userQuery = String(event.userQuery || "").slice(0, 500)
  const matchedCard = pickCardFields(event.matchedCard || {})
  const corePosition = String(event.corePosition || "詹姆斯不是完美球员，但至少是 NBA 历史第二。").slice(0, 500)

  return [
    `用户输入：${userQuery}`,
    `核心立场：${corePosition}`,
    `命中的本地反驳卡：${JSON.stringify(matchedCard)}`,
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

function requestDeepSeek(payload, apiKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(DEEPSEEK_API_URL)
    const body = JSON.stringify(payload)

    const req = https.request(
      {
        method: "POST",
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: `Bearer ${apiKey}`
        },
        timeout: 30000
      },
      (res) => {
        const chunks = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8")
          const data = safeJsonParse(raw)
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`DeepSeek request failed: ${res.statusCode} ${raw.slice(0, 500)}`))
            return
          }
          resolve(data)
        })
      }
    )

    req.on("timeout", () => {
      req.destroy(new Error("DeepSeek request timeout"))
    })
    req.on("error", reject)
    req.write(body)
    req.end()
  })
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

exports.main = async (event) => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      error: "DEEPSEEK_API_KEY_NOT_CONFIGURED"
    }
  }

  const payload = {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(event || {}) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1200,
    thinking: {
      type: process.env.DEEPSEEK_THINKING || "disabled"
    }
  }

  try {
    const data = await requestDeepSeek(payload, apiKey)
    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : ""

    return {
      ok: true,
      model: DEEPSEEK_MODEL,
      reply: normalizeReply(content),
      usage: data.usage || null
    }
  } catch (error) {
    return {
      ok: false,
      error: "DEEPSEEK_REQUEST_FAILED",
      message: error.message
    }
  }
}
