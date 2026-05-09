const aliases = require("../data/aliases")
const cards = require("../data/rebuttal_cards")
const categories = require("../data/categories")
const { normalizeQuery } = require("./normalizeQuery")

function fallbackCard(input) {
  return {
    id: "general",
    category: "通用反驳",
    claim: input || "通用黑点",
    valid_part: "用户输入过短或没有命中明确黑点。",
    logic_flaw: "评价标准不明确，容易变成先定结论再找证据。",
    comparison: "需要先明确是比冠军、FMVP、MVP、巅峰高度、巅峰长度、季后赛产出、攻防综合，还是单纯个人审美。",
    facts: [],
    short_reply: "你这个观点需要先明确评价标准。标准不统一，就只是情绪输出。",
    long_reply: "评价詹姆斯不能只靠一句黑称。你要先明确标准：是比冠军、FMVP、MVP、季后赛产出、巅峰高度、巅峰长度、攻防综合，还是只比个人审美？如果标准不统一，只盯着詹姆斯缺点、不看其他球星同类问题，那就是双标，不是懂球。",
    one_liner: "先统一标准，再谈历史地位。",
    video_script: "很多人黑詹姆斯，其实不是在评价篮球，而是在先定结论再找证据。真正公平的比较，必须统一标准：冠军、FMVP、MVP、季后赛产出、巅峰高度、巅峰长度、攻防综合和时代影响力都要看。只盯一个黑点不看完整生涯，这不是分析，是情绪。",
    tags: ["通用", "标准", "双标"]
  }
}

function categoryFallback(category, input) {
  return {
    id: `${category.id}_fallback`,
    category: category.name,
    claim: input,
    valid_part: "该输入命中了一个黑点类别，但暂时没有更具体的反驳卡。",
    logic_flaw: "不能只用短梗替代完整论证，需要回到事实、标准和同标准对比。",
    comparison: category.rebuttal_strategy,
    facts: [],
    short_reply: category.rebuttal_strategy,
    long_reply: `这个观点命中了「${category.name}」。核心反驳方向是：${category.rebuttal_strategy} 讨论詹姆斯可以承认争议，但必须同标准审视其他球星，不能只在詹姆斯身上无限加码。`,
    one_liner: "别先定结论，再临时发明标准。",
    video_script: `这个黑点属于${category.name}。要反驳它，重点不是无脑吹詹姆斯，而是先承认可承认的事实，再看对方有没有偷换概念、双重标准或选择性记忆。`,
    tags: [category.name, category.parent_category]
  }
}

function uniqueByCardId(items) {
  const seen = {}
  return items.filter((item) => {
    const id = item.card.id
    if (seen[id]) return false
    seen[id] = true
    return true
  })
}

function removeNoisyFallbacks(items) {
  const categoriesWithExactCard = {}
  items.forEach((item) => {
    if (!String(item.card.id).endsWith("_fallback")) {
      categoriesWithExactCard[item.categoryId || item.category] = true
    }
  })
  return items.filter((item) => {
    if (!String(item.card.id).endsWith("_fallback")) return true
    return !categoriesWithExactCard[item.categoryId || item.category]
  })
}

function matchQuery(input) {
  const q = normalizeQuery(input)
  if (!q) {
    return [{ alias: "通用", category: "通用反驳", priority: 1, card: fallbackCard(input) }]
  }

  const matchedAliases = aliases
    .filter((item) => q.includes(normalizeQuery(item.alias)))
    .sort((a, b) => b.priority - a.priority)

  const results = matchedAliases
    .map((alias) => {
      const category = categories.find((item) => item.id === alias.categoryId)
      const card = alias.targetId
        ? cards.find((item) => item.id === alias.targetId)
        : null
      return {
        alias: alias.alias,
        category: category ? category.name : alias.categoryId,
        categoryId: alias.categoryId,
        priority: alias.priority,
        card: card || (category ? categoryFallback(category, input) : fallbackCard(input))
      }
    })
    .filter((item) => item.card)

  if (results.length > 0) {
    return removeNoisyFallbacks(uniqueByCardId(results)).slice(0, 5)
  }

  return [{ alias: "通用", category: "通用反驳", priority: 1, card: fallbackCard(input) }]
}

function randomCard() {
  const index = Math.floor(Math.random() * cards.length)
  return cards[index]
}

module.exports = {
  matchQuery,
  randomCard
}
