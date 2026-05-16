const baseCards = require("./rebuttal_cards")
const extraCards = require("./rebuttal_cards_extra")
const docxCards = require("./rebuttal_cards_docx")
const v21Cards = require("./rebuttal_cards_v2_1")
const starsCards = require("./rebuttal_cards_stars")
const starsV2aCards = require("./rebuttal_cards_stars_v2a")
const starsV2bCards = require("./rebuttal_cards_stars_v2b")
const legendsCards = require("./rebuttal_cards_legends")
const baseAliases = require("./aliases")
const docxAliases = require("./aliases_docx")
const v21AliasesRaw = require("./aliases_v2_1")
const starsAliases = require("./aliases_stars")
const starsV2aAliases = require("./aliases_stars_v2a")
const starsV2bAliases = require("./aliases_stars_v2b")
const legendsAliases = require("./aliases_legends")
const extendedData = require("./rebuttal_cards_extended")
const extendedP2 = require("./rebuttal_cards_extended_p2")
const extendedV21 = require("./rebuttal_cards_extended_v2_1")
const extendedP3 = require("./rebuttal_cards_extended_p3")
const extendedP4 = require("./rebuttal_cards_extended_p4")

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
  .concat(starsV2aCards)
  .concat(starsV2bCards)
  .concat(legendsCards)

const aliases = baseAliases
  .concat(docxAliases)
  .concat(v21Aliases)
  .concat(starsAliases)
  .concat(starsV2aAliases)
  .concat(starsV2bAliases)
  .concat(legendsAliases)

// 合并所有 extended 来源
const extendedById = Object.assign(
  {},
  (extendedData && extendedData.extendedById) || {},
  (extendedP2 && extendedP2.extendedById) || {},
  (extendedV21 && extendedV21.extendedById) || {},
  (extendedP3 && extendedP3.extendedById) || {},
  (extendedP4 && extendedP4.extendedById) || {}
)

module.exports = {
  cards,
  aliases,
  extendedById,
  baseCards,
  extraCards,
  docxCards,
  v21Cards,
  starsCards,
  starsV2aCards,
  starsV2bCards,
  legendsCards,
  baseAliases,
  docxAliases,
  v21Aliases,
  starsAliases,
  starsV2aAliases,
  starsV2bAliases,
  legendsAliases,
  stats: {
    baseCards: baseCards.length,
    extraCards: extraCards.length,
    docxCards: docxCards.length,
    v21Cards: v21Cards.length,
    starsCards: starsCards.length,
    starsV2aCards: starsV2aCards.length,
    starsV2bCards: starsV2bCards.length,
    legendsCards: legendsCards.length,
    docxReviewNeeded: (docxCards.reviewNeeded || []).length,
    baseAliases: baseAliases.length,
    docxAliases: docxAliases.length,
    v21Aliases: v21Aliases.length,
    starsAliases: starsAliases.length,
    starsV2aAliases: starsV2aAliases.length,
    starsV2bAliases: starsV2bAliases.length,
    legendsAliases: legendsAliases.length,
    totalCards: cards.length,
    totalAliases: aliases.length,
    extendedKeys: Object.keys(extendedById).length
  }
}
