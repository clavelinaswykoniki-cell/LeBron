const baseCards = require("../miniprogram/data/rebuttal_cards")
const extraCards = require("../miniprogram/data/rebuttal_cards_extra")
const baseAliases = require("../miniprogram/data/aliases")
const docxCards = require("../miniprogram/data/rebuttal_cards_docx")
const docxAliases = require("../miniprogram/data/aliases_docx")
const arsenal = require("../miniprogram/data/arsenal")

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function findDuplicates(items) {
  const seen = new Set()
  const duplicates = new Set()
  items.forEach((item) => {
    if (seen.has(item)) duplicates.add(item)
    seen.add(item)
  })
  return Array.from(duplicates)
}

const docxReviewNeeded = docxCards.reviewNeeded || []
const docxStats = docxCards.stats || {}

assert(baseCards.length === 43, `baseCards expected 43, got ${baseCards.length}`)
assert(extraCards.length === 57, `extraCards expected 57, got ${extraCards.length}`)
assert(baseCards.length + extraCards.length === 100, "old baseline card count changed")
assert(baseAliases.length === 348, `baseAliases expected 348, got ${baseAliases.length}`)
assert(docxStats.rawCount === docxCards.length + docxReviewNeeded.length, "docx raw count mismatch")
assert(docxStats.rawCount === 50, `docx raw count expected 50, got ${docxStats.rawCount}`)
assert(docxReviewNeeded.length > 0, "expected some review_needed docx items")

const cardIds = arsenal.cards.map((card) => card.id)
const duplicateCardIds = findDuplicates(cardIds)
assert(duplicateCardIds.length === 0, `duplicate card ids: ${duplicateCardIds.join(", ")}`)

const badFacts = docxCards.filter((card) => Array.isArray(card.facts) && card.facts.length > 0)
assert(badFacts.length === 0, "docx cards must not expose unverified facts")

const riskyDisplayPattern = /脑子坏|关你屁事|你懂球|你熬一个|瞎啊|黑子|软蛋|我就笑了|你这|你看过|这不是双标是什么/
const riskyApproved = docxCards.filter((card) => {
  const text = [card.claim, card.short_reply, card.long_reply, card.one_liner, card.video_script].join(" ")
  return riskyDisplayPattern.test(text)
})
assert(riskyApproved.length === 0, `approved docx cards contain risky display terms: ${riskyApproved.map((card) => card.id).join(", ")}`)

const brokenAliases = docxAliases.filter((alias) => !arsenal.cards.some((card) => card.id === alias.targetId))
assert(brokenAliases.length === 0, `aliases target missing cards: ${brokenAliases.map((alias) => alias.alias).join(", ")}`)

console.log(`corpus ok: base=100 docx_approved=${docxCards.length} docx_review_needed=${docxReviewNeeded.length} docx_aliases=${docxAliases.length} total_cards=${arsenal.cards.length} total_aliases=${arsenal.aliases.length}`)
