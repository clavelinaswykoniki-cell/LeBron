const baseCards = require("./rebuttal_cards")
const extraCards = require("./rebuttal_cards_extra")
const docxCards = require("./rebuttal_cards_docx")
const baseAliases = require("./aliases")
const docxAliases = require("./aliases_docx")

const cards = baseCards.concat(extraCards).concat(docxCards)
const aliases = baseAliases.concat(docxAliases)

module.exports = {
  cards,
  aliases,
  baseCards,
  extraCards,
  docxCards,
  baseAliases,
  docxAliases,
  stats: {
    baseCards: baseCards.length,
    extraCards: extraCards.length,
    docxCards: docxCards.length,
    docxReviewNeeded: (docxCards.reviewNeeded || []).length,
    baseAliases: baseAliases.length,
    docxAliases: docxAliases.length,
    totalCards: cards.length,
    totalAliases: aliases.length
  }
}
