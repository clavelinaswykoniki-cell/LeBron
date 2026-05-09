function normalizeQuery(input) {
  if (!input) return ""
  return String(input)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[，。！？、,.!?;；:："'“”‘’（）()【】\[\]{}]/g, "")
    .replace(/八分/g, "8分")
    .replace(/老张/g, "詹姆斯")
    .replace(/老詹/g, "詹姆斯")
    .replace(/勒布朗/g, "詹姆斯")
    .replace(/lbj/g, "詹姆斯")
    .toLowerCase()
}

module.exports = {
  normalizeQuery
}
