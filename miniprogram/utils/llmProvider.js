/**
 * llmProvider.js — LLM 增强反驳接入
 *
 * 当前架构（v2.5+）：
 *   小程序 → 自家后端 /api/llm/enhance → DeepSeek API
 *   key 只在 server/.env，不出现在前端
 *
 * 失败时返回 null，由 caller（结果页）回退到本地反驳卡
 * （遵守 CLAUDE.md 硬约束：CloudBase failure must always fall back to local cards）
 *
 * Legacy: cloudfunctions/generateReply/ 是旧的 CloudBase 调用路径，保留代码但前端不再走它。
 *         未来若要做多路 fallback，可以再加 callCloudFunction 作为第二跳。
 */

const api = require("./api")

function generateWithLocalCard(card) {
  return {
    short_reply: card.short_reply,
    long_reply: card.long_reply,
    one_liner: card.one_liner,
    video_script: card.video_script
  }
}

function normalizeEnhancedReply(reply) {
  if (!reply || typeof reply !== "object") return null
  const normalized = {
    short_reply: String(reply.short_reply || "").trim(),
    long_reply: String(reply.long_reply || "").trim(),
    one_liner: String(reply.one_liner || "").trim(),
    video_script: String(reply.video_script || "").trim()
  }
  if (!normalized.short_reply || !normalized.long_reply || !normalized.one_liner || !normalized.video_script) {
    return null
  }
  return normalized
}

async function generateEnhancedReply(params) {
  params = params || {}
  if (typeof params.userQuery !== "string" || !params.userQuery.trim()) {
    return null
  }
  try {
    const result = await api.post("/api/llm/enhance", {
      userQuery: params.userQuery || "",
      matchedCard: params.matchedCard || {},
      corePosition: params.corePosition || ""
    }, { timeout: 30000 })
    if (!result || result.ok !== true) {
      console.warn("[llm] enhance 返回非 ok:", result && result.error)
      return null
    }
    return normalizeEnhancedReply(result.reply)
  } catch (e) {
    console.warn("[llm] enhance 失败:", e.message)
    return null
  }
}

module.exports = {
  generateWithLocalCard,
  generateEnhancedReply,
  normalizeEnhancedReply
}
