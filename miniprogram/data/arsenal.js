const baseCards = require("./rebuttal_cards")
const extraCards = require("./rebuttal_cards_extra")
const docxCards = require("./rebuttal_cards_docx")
const v21Cards = require("./rebuttal_cards_v2_1")
const starsCards = require("./rebuttal_cards_stars")
const baseAliases = require("./aliases")
const docxAliases = require("./aliases_docx")
const v21AliasesRaw = require("./aliases_v2_1")
const starsAliases = require("./aliases_stars")
const extendedData = require("./rebuttal_cards_extended")

/**
 * v2.1 别名采用 `{ term, card_ids, priority }` 结构（1 高 / 2 中 / 3 低）。
 * 此处归一为 `{ alias, categoryId, targetId, priority }` 与 baseAliases / docxAliases 对齐。
 */
const V21_PRIORITY_MAP = { 1: 120, 2: 100, 3: 90 }
function normalizeV21Alias(item) {
  return {
    alias: item.term,
    categoryId: null,
    targetId: (item.card_ids && item.card_ids[0]) || null,
    priority: V21_PRIORITY_MAP[item.priority] || 100
  }
}
const v21Aliases = (Array.isArray(v21AliasesRaw) ? v21AliasesRaw : []).map(normalizeV21Alias)

const cards = baseCards
  .concat(extraCards)
  .concat(docxCards)
  .concat(v21Cards)
  .concat(starsCards)

const aliases = baseAliases
  .concat(docxAliases)
  .concat(v21Aliases)
  .concat(starsAliases)

module.exports = {
  cards,
  aliases,
  extendedById: (extendedData && extendedData.extendedById) || {},
  baseCards,
  extraCards,
  docxCards,
  v21Cards,
  starsCards,
  baseAliases,
  docxAliases,
  v21Aliases,
  starsAliases,
  stats: {
    baseCards: baseCards.length,
    extraCards: extraCards.length,
    docxCards: docxCards.length,
    v21Cards: v21Cards.length,
    starsCards: starsCards.length,
    docxReviewNeeded: (docxCards.reviewNeeded || []).length,
    baseAliases: baseAliases.length,
    docxAliases: docxAliases.length,
    v21Aliases: v21Aliases.length,
    starsAliases: starsAliases.length,
    totalCards: cards.length,
    totalAliases: aliases.length
  }
}
