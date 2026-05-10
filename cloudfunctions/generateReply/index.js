const cloud = require("wx-server-sdk")
const https = require("https")

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEEPSEEK_API_URL = `${process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"}/chat/completions`
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro"

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
    "你是“詹姆斯黑粉观点反驳器”的中文回复生成模型。",
    "核心立场：詹姆斯不是完美球员，但至少是 NBA 历史第二。",
    "反驳方法：承认可承认事实，拆逻辑漏洞，做同标准横向对比。",
    "语言风格：强硬、直接、适合评论区和短视频口播，但只围绕篮球观点。",
    "禁止：造谣、编造数据、人身攻击、攻击球员家人和私生活、辱骂用户。",
    "如果资料不足，必须提示需要核对事实，不要硬编。",
    "只输出 JSON，不要输出 Markdown，不要输出解释。"
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
    max_tokens: 1800,
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
