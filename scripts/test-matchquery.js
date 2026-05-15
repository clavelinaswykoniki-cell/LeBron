/**
 * scripts/test-matchquery.js
 *
 * Unit tests for miniprogram/utils/matchQuery.js
 * Validates that the local matcher hits known aliases, falls back gracefully,
 * and that randomCard returns a structurally valid card.
 */

const assert = require("assert")
const { matchQuery, randomCard } = require("../miniprogram/utils/matchQuery")
const arsenal = require("../miniprogram/data/arsenal")

function isFallback(card) {
  if (!card) return true
  const id = String(card.id || "")
  return id === "general" || id.endsWith("_fallback")
}

// ============ test 1: 8分 命中具体卡（非 fallback） ============
function test_match_8_points() {
  const results = matchQuery("8分")
  assert.ok(Array.isArray(results) && results.length >= 1, "应至少命中 1 张卡")
  // 应该至少有一条非 fallback 命中（具体的 8 分卡）
  const exact = results.find((r) => !isFallback(r.card))
  assert.ok(exact, "8分 应命中具体卡，不应只 fallback。results=" + JSON.stringify(results.map((r) => r.card.id)))
  // alias 文本里至少有一条包含 '8'
  const aliasMatch = results.some((r) => String(r.alias || "").indexOf("8") >= 0)
  assert.ok(aliasMatch, "应有 alias 包含 '8'，实际 aliases=" + JSON.stringify(results.map((r) => r.alias)))
  console.log("✓ test_match_8_points")
}

// ============ test 2: Excel球王 命中 ============
function test_match_excel() {
  const results = matchQuery("Excel球王")
  assert.ok(Array.isArray(results) && results.length >= 1, "Excel球王 应命中至少 1 张")
  const exact = results.find((r) => !isFallback(r.card))
  assert.ok(exact, "Excel球王 应命中具体卡。results=" + JSON.stringify(results.map((r) => r.card.id)))
  console.log("✓ test_match_excel")
}

// ============ test 3: 乔丹十个得分王 命中 ============
function test_match_jordan_scoring() {
  const results = matchQuery("乔丹十个得分王")
  assert.ok(Array.isArray(results) && results.length >= 1, "乔丹十个得分王 应命中至少 1 张")
  const exact = results.find((r) => !isFallback(r.card))
  assert.ok(exact, "乔丹十个得分王 应命中具体卡。results=" + JSON.stringify(results.map((r) => r.card.id)))
  console.log("✓ test_match_jordan_scoring")
}

// ============ test 4: 不存在的词 → fallback 到通用反驳卡 ============
function test_unknown_query_fallback() {
  const results = matchQuery("xxx随机不存在的词zzz")
  assert.ok(Array.isArray(results) && results.length >= 1, "未知词也应返回 fallback 卡")
  const card = results[0].card
  assert.ok(card, "结果应带 card 对象")
  // 通用反驳：id === 'general' 或 category 含 '通用'
  const generic = card.id === "general" || String(card.category || "").indexOf("通用") >= 0
  assert.ok(generic, "未知词应 fallback 到通用反驳卡。card.id=" + card.id + " category=" + card.category)
  console.log("✓ test_unknown_query_fallback")
}

// ============ test 5: 空字符串 → 空数组 或 fallback ============
function test_empty_query() {
  const results = matchQuery("")
  assert.ok(Array.isArray(results), "matchQuery('') 应返回数组")
  // 按 matchQuery 实现：空查询走 fallbackCard 路径，返回 1 项 fallback
  if (results.length > 0) {
    const card = results[0].card
    assert.ok(isFallback(card) || card.id === "general", "空查询非空时应是 fallback 卡，card.id=" + card.id)
  }
  console.log("✓ test_empty_query (length=" + results.length + ")")
}

// ============ test 6: 含空格的 '8 分' 仍命中 ============
function test_match_8_points_with_space() {
  const results = matchQuery("8 分")
  assert.ok(Array.isArray(results) && results.length >= 1, "'8 分'(含空格) 应至少命中 1 张")
  const exact = results.find((r) => !isFallback(r.card))
  assert.ok(exact, "'8 分'(含空格) 应命中具体卡。results=" + JSON.stringify(results.map((r) => r.card.id)))
  console.log("✓ test_match_8_points_with_space")
}

// ============ test 7: randomCard 返回一张结构合法的卡 ============
function test_random_card() {
  assert.ok(Array.isArray(arsenal.cards) && arsenal.cards.length > 0, "arsenal.cards 应非空")
  const card = randomCard()
  assert.ok(card, "randomCard 应返回对象")
  assert.ok(card.id, "card.id 必须存在，实际=" + JSON.stringify(card))
  assert.ok(card.claim, "card.claim 必须存在，id=" + card.id)
  assert.ok(card.short_reply, "card.short_reply 必须存在，id=" + card.id)
  console.log("✓ test_random_card (id=" + card.id + ")")
}

// ============ test 8: matchQuery 结果不超过 5 条 ============
function test_results_capped() {
  const results = matchQuery("詹姆斯")
  assert.ok(Array.isArray(results), "应返回数组")
  assert.ok(results.length <= 5, "matchQuery 结果应不超过 5 条，实际=" + results.length)
  console.log("✓ test_results_capped (length=" + results.length + ")")
}

// ============ run all ============
const tests = [
  test_match_8_points,
  test_match_excel,
  test_match_jordan_scoring,
  test_unknown_query_fallback,
  test_empty_query,
  test_match_8_points_with_space,
  test_random_card,
  test_results_capped
]

let failed = 0
tests.forEach((t) => {
  try {
    t()
  } catch (e) {
    failed += 1
    console.error("✗ " + t.name + ": " + e.message)
  }
})

if (failed > 0) {
  console.error("\nmatchquery " + failed + "/" + tests.length + " tests FAILED")
  process.exit(1)
} else {
  console.log("\nmatchquery " + tests.length + "/" + tests.length + " tests ok")
}
