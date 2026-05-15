/**
 * scripts/test-storage.js
 *
 * Unit tests for miniprogram/utils/storage.js
 * Stubs global.wx.storage so we can verify state transitions in Node.
 */

const assert = require("assert")
const path = require("path")

const STORAGE_PATH = path.join(__dirname, "..", "miniprogram", "utils", "storage.js")

function freshStorage() {
  delete require.cache[require.resolve(STORAGE_PATH)]
  return require(STORAGE_PATH)
}

function makeWxStub() {
  const data = {}
  global.wx = {
    getStorageSync: (k) => (k in data ? data[k] : ""),
    setStorageSync: (k, v) => { data[k] = v },
    _dump: () => data
  }
  return data
}

function reset() {
  if (global.wx && global.wx._dump) {
    const s = global.wx._dump()
    Object.keys(s).forEach((k) => delete s[k])
  }
}

// ============ test 1: 默认 empty ============
function test_default_empty() {
  makeWxStub()
  const s = freshStorage()
  assert.deepStrictEqual(s.getSearchHistory(), [], "默认历史为空数组")
  assert.deepStrictEqual(s.getFavorites(), [], "默认收藏为空数组")
  assert.strictEqual(s.isFavorited("any-id"), false, "默认 isFavorited=false")
  console.log("✓ test_default_empty")
}

// ============ test 2: search history 顺序 + dedup ============
function test_search_history_dedup() {
  makeWxStub()
  const s = freshStorage()
  s.recordSearchHistory("8分")
  s.recordSearchHistory("Excel球王")
  s.recordSearchHistory("8分") // 重复 → 应升到最前
  const history = s.getSearchHistory()
  assert.strictEqual(history.length, 2, "去重后只剩 2 条")
  assert.strictEqual(history[0].query, "8分", "最新搜的应该在最前")
  assert.strictEqual(history[1].query, "Excel球王", "第二条是 Excel球王")
  console.log("✓ test_search_history_dedup")
}

// ============ test 3: search history MAX_HISTORY 截断 ============
function test_search_history_truncate() {
  makeWxStub()
  const s = freshStorage()
  for (let i = 0; i < 25; i++) {
    s.recordSearchHistory("查询" + i)
  }
  const history = s.getSearchHistory()
  assert.strictEqual(history.length, 20, "超过 20 应截断到 20，实际 " + history.length)
  assert.strictEqual(history[0].query, "查询24", "最新查询在最前")
  console.log("✓ test_search_history_truncate")
}

// ============ test 4: clearSearchHistory ============
function test_clear_history() {
  makeWxStub()
  const s = freshStorage()
  s.recordSearchHistory("8分")
  s.recordSearchHistory("米奇")
  assert.strictEqual(s.getSearchHistory().length, 2)
  s.clearSearchHistory()
  assert.deepStrictEqual(s.getSearchHistory(), [], "清空后为空")
  console.log("✓ test_clear_history")
}

// ============ test 5: toggleFavorite roundtrip ============
function test_toggle_favorite() {
  makeWxStub()
  const s = freshStorage()
  const snapshot = { id: "card_a", category: "X", claim: "Y", short_reply: "Z" }
  const r1 = s.toggleFavorite("card_a", snapshot)
  assert.strictEqual(r1, true, "首次 toggle 应 favorited=true")
  assert.strictEqual(s.isFavorited("card_a"), true)
  assert.strictEqual(s.getFavorites().length, 1)
  const r2 = s.toggleFavorite("card_a", snapshot)
  assert.strictEqual(r2, false, "再次 toggle 应 favorited=false")
  assert.strictEqual(s.isFavorited("card_a"), false)
  assert.strictEqual(s.getFavorites().length, 0)
  console.log("✓ test_toggle_favorite")
}

// ============ test 6: favorites 最新在前 ============
function test_favorites_order() {
  makeWxStub()
  const s = freshStorage()
  s.toggleFavorite("a", { id: "a", claim: "A" })
  s.toggleFavorite("b", { id: "b", claim: "B" })
  s.toggleFavorite("c", { id: "c", claim: "C" })
  const favs = s.getFavorites()
  assert.strictEqual(favs[0].id, "c", "最新收藏的应在最前")
  assert.strictEqual(favs[2].id, "a", "最早的在最后")
  console.log("✓ test_favorites_order")
}

// ============ test 7: 空 / 无效 cardId 忽略 ============
function test_invalid_input_ignored() {
  makeWxStub()
  const s = freshStorage()
  s.recordSearchHistory("")
  s.recordSearchHistory("   ")
  s.recordSearchHistory(null)
  s.recordSearchHistory(undefined)
  s.recordSearchHistory(123)
  assert.strictEqual(s.getSearchHistory().length, 0, "无效输入应被忽略")
  const r = s.toggleFavorite("", { id: "" })
  assert.strictEqual(r, false, "空 cardId 应返回 false 不入库")
  assert.strictEqual(s.getFavorites().length, 0)
  console.log("✓ test_invalid_input_ignored")
}

// ============ test 8: 损坏 storage 兜底 ============
function test_corrupt_storage() {
  makeWxStub()
  global.wx.getStorageSync = () => { throw new Error("simulated storage failure") }
  const s = freshStorage()
  assert.deepStrictEqual(s.getSearchHistory(), [], "storage 抛错时返回 default")
  assert.deepStrictEqual(s.getFavorites(), [], "storage 抛错时返回 default")
  assert.strictEqual(s.isFavorited("x"), false)
  console.log("✓ test_corrupt_storage")
}

// ============ test 9: 没有 wx 不崩 ============
function test_no_wx_global() {
  delete global.wx
  const s = freshStorage()
  assert.deepStrictEqual(s.getSearchHistory(), [])
  assert.deepStrictEqual(s.getFavorites(), [])
  s.recordSearchHistory("test")
  s.toggleFavorite("test", {})
  s.clearSearchHistory()
  console.log("✓ test_no_wx_global")
}

// ============ run all ============
const tests = [
  test_default_empty,
  test_search_history_dedup,
  test_search_history_truncate,
  test_clear_history,
  test_toggle_favorite,
  test_favorites_order,
  test_invalid_input_ignored,
  test_corrupt_storage,
  test_no_wx_global
]

let failed = 0
tests.forEach((t) => {
  try {
    reset()
    t()
  } catch (e) {
    failed += 1
    console.error("✗ " + t.name + ": " + e.message)
  }
})

if (failed > 0) {
  console.error("\nstorage " + failed + "/" + tests.length + " tests FAILED")
  process.exit(1)
} else {
  console.log("\nstorage " + tests.length + "/" + tests.length + " tests ok")
}
