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

function callCloudFunction(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "generateReply",
      data,
      success: resolve,
      fail: reject
    })
  })
}

async function generateEnhancedReply(params) {
  if (typeof wx === "undefined" || !wx.cloud || typeof wx.cloud.callFunction !== "function") {
    return null
  }

  try {
    const response = await callCloudFunction({
      userQuery: params.userQuery || "",
      matchedCard: params.matchedCard || {},
      corePosition: params.corePosition || ""
    })
    const result = response && response.result ? response.result : response
    if (!result || result.ok !== true) return null
    return normalizeEnhancedReply(result.reply)
  } catch (error) {
    return null
  }
}

module.exports = {
  generateWithLocalCard,
  generateEnhancedReply
}
