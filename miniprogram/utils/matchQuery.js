const arsenal = require("../data/arsenal")
const categories = require("../data/categories")
const { normalizeQuery } = require("./normalizeQuery")

const { aliases, cards } = arsenal

/* ------------------------------------------------------------------ *
 * 索引：module 加载时一次性建好，匹配时全部 O(1) 查表。
 *
 * 早期版本里：每次 matchQuery 都要
 *   - aliases.filter() 中对每个 alias 重新 normalizeQuery     → O(n)
 *   - 然后对每个命中 alias 再 categories.find / cards.find   → O(n·m)
 *
 * 现在：
 *   - _ALIASES_NORMALIZED[i] 预先归一好（normalizeQuery 自带 LRU，仍然便宜）
 *   - _CARDS_BY_ID / _CATEGORIES_BY_ID 是 Map，find 改成 get
 * ------------------------------------------------------------------ */

const _CARDS_BY_ID = new Map()
for (let i = 0; i < cards.length; i++) {
  const c = cards[i]
  if (c && c.id != null) _CARDS_BY_ID.set(c.id, c)
}

const _CATEGORIES_BY_ID = new Map()
for (let i = 0; i < categories.length; i++) {
  const cat = categories[i]
  if (cat && cat.id != null) _CATEGORIES_BY_ID.set(cat.id, cat)
}

// 把每个 alias 的归一字符串预先算好，避免每次匹配重算
const _ALIASES_NORMALIZED = aliases.map(function (a) {
  return normalizeQuery(a.alias)
})

/* ------------------------------------------------------------------ *
 * fallback 卡片
 * ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ *
 * 内部辅助
 * ------------------------------------------------------------------ */

function _isFallbackId(id) {
  // id 为 number 时 String() 是必须的；为 string 时直接 endsWith 也行
  // 但统一走 String 比较稳
  return typeof id === "string"
    ? id.endsWith("_fallback")
    : String(id).endsWith("_fallback")
}

/**
 * 同时做去重 + 去噪：
 *   - 去重：按 card.id 唯一
 *   - 去噪：如果某个 category 已有真实卡命中，就把同 category 下的 *_fallback 卡过滤掉；
 *           如果一条真实卡都没有，则保留所有 fallback。
 *
 * 早期版本里这两件事是两次 filter，要扫 items 三遍；这里合并为一次扫描。
 */
function _dedupAndDenoise(items) {
  const seenIds = new Set()
  const categoriesWithRealCard = new Set()
  let anyRealCard = false

  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!_isFallbackId(it.card.id)) {
      anyRealCard = true
      categoriesWithRealCard.add(it.categoryId || it.category)
    }
  }

  const out = []
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const id = it.card.id
    if (seenIds.has(id)) continue
    seenIds.add(id)

    if (_isFallbackId(id)) {
      // 如果有真实卡，整体丢 fallback；
      // 如果没有真实卡但同 category 已有真实卡（罕见），也丢
      if (anyRealCard) continue
      if (categoriesWithRealCard.has(it.categoryId || it.category)) continue
    }
    out.push(it)
  }
  return out
}

/* ------------------------------------------------------------------ *
 * 主入口
 * ------------------------------------------------------------------ */

function matchQuery(input) {
  const q = normalizeQuery(input)
  if (!q) {
    return [{ alias: "通用", category: "通用反驳", priority: 1, card: fallbackCard(input) }]
  }

  // 一次扫描：用预归一表筛选命中 alias，附带 priority
  const hits = []
  for (let i = 0; i < aliases.length; i++) {
    const normAlias = _ALIASES_NORMALIZED[i]
    if (normAlias && q.includes(normAlias)) {
      hits.push(aliases[i])
    }
  }
  if (hits.length === 0) {
    return [{ alias: "通用", category: "通用反驳", priority: 1, card: fallbackCard(input) }]
  }

  // 按 priority 降序
  hits.sort(function (a, b) { return b.priority - a.priority })

  // 装配 result item（Map.get 全部 O(1)）
  const results = []
  for (let i = 0; i < hits.length; i++) {
    const alias = hits[i]
    const category = alias.categoryId ? _CATEGORIES_BY_ID.get(alias.categoryId) : null
    const card = alias.targetId ? _CARDS_BY_ID.get(alias.targetId) : null
    const finalCard = card || (category ? categoryFallback(category, input) : fallbackCard(input))
    if (!finalCard) continue
    results.push({
      alias: alias.alias,
      category: category ? category.name : (card ? card.category : alias.categoryId),
      categoryId: alias.categoryId,
      priority: alias.priority,
      card: finalCard
    })
  }

  if (results.length === 0) {
    return [{ alias: "通用", category: "通用反驳", priority: 1, card: fallbackCard(input) }]
  }
  return _dedupAndDenoise(results).slice(0, 5)
}

function randomCard() {
  if (!cards.length) return null
  const index = Math.floor(Math.random() * cards.length)
  return cards[index]
}

module.exports = {
  matchQuery,
  randomCard
}
