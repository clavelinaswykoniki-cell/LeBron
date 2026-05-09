const corePositions = require("../data/core_positions")

function buildPrompt(userQuery, matchedCard) {
  return [
    "你是“詹姆斯黑粉观点反驳器”的中文回复生成模型。",
    `核心立场：${corePositions.stance}`,
    "任务：基于命中的反驳卡，生成强硬但只围绕篮球观点的回复。",
    "要求：承认可承认事实，拆逻辑漏洞，做同标准横向对比，不编造数据，不攻击家人私生活，不做人身攻击。",
    "输出 JSON：short_reply, long_reply, one_liner, video_script。",
    `用户输入：${userQuery}`,
    `命中卡片：${JSON.stringify(matchedCard, null, 2)}`
  ].join("\n")
}

module.exports = {
  buildPrompt
}
