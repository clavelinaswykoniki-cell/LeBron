/**
 * scripts/test-progression.js
 *
 * Unit tests for miniprogram/utils/progression.js
 * Stubs global.wx.storage so we can verify state transitions in Node.
 */

const assert = require("assert")
const path = require("path")

const PROGRESSION_PATH = path.join(__dirname, "..", "miniprogram", "utils", "progression.js")

function freshProgression() {
  // 清掉 require cache 让 progression 重新初始化
  delete require.cache[require.resolve(PROGRESSION_PATH)]
  return require(PROGRESSION_PATH)
}

function makeStorageStub() {
  const store = {}
  global.wx = {
    getStorageSync: (key) => {
      return store[key] || ""
    },
    setStorageSync: (key, val) => {
      store[key] = val
    },
    _dump: () => store
  }
  return store
}

function reset() {
  if (global.wx && global.wx._dump) {
    const s = global.wx._dump()
    Object.keys(s).forEach((k) => delete s[k])
  }
}

// ============ test 1: 初始状态 ============
function test_default_state() {
  makeStorageStub()
  const p = freshProgression()
  const snap = p.getCurrentRank()
  assert.strictEqual(snap.rank.id, "bronze", "默认段位应为 bronze")
  assert.strictEqual(snap.viewCount, 0, "默认 viewCount=0")
  assert.strictEqual(snap.copyCount, 0, "默认 copyCount=0")
  assert.strictEqual(snap.badges.filter((b) => b.unlocked).length, 0, "默认无勋章")
  console.log("✓ test_default_state")
}

// ============ test 2: 重复 view 同一 cardId 不增加 viewCount ============
function test_view_dedup() {
  makeStorageStub()
  const p = freshProgression()
  p.recordCardView("card-A", "2011")
  p.recordCardView("card-A", "2011")
  p.recordCardView("card-A", "2011")
  const snap = p.getCurrentRank()
  assert.strictEqual(snap.viewCount, 1, "同一 cardId 重复浏览只算 1 次，得到 " + snap.viewCount)
  console.log("✓ test_view_dedup")
}

// ============ test 3: 跨过 threshold 10 升级到 silver + 解锁 view_10 ============
function test_silver_threshold() {
  makeStorageStub()
  const p = freshProgression()
  let lastRankUp = false
  let lastBadges = []
  for (let i = 0; i < 10; i++) {
    const r = p.recordCardView("card-" + i, "cat-" + i)
    if (r.rankUp) lastRankUp = true
    if (r.badgesUnlocked && r.badgesUnlocked.length) lastBadges = lastBadges.concat(r.badgesUnlocked)
  }
  const snap = p.getCurrentRank()
  assert.strictEqual(snap.viewCount, 10, "10 张不同卡 viewCount=10")
  assert.strictEqual(snap.rank.id, "silver", "viewCount 10 应升 silver，实际 " + snap.rank.id)
  assert.ok(lastRankUp, "至少触发过一次 rankUp")
  const view_10 = snap.badges.find((b) => b.id === "view_10")
  assert.ok(view_10 && view_10.unlocked, "view_10 勋章应解锁")
  console.log("✓ test_silver_threshold")
}

// ============ test 4: 复制 50 次解锁 copy_50 ============
function test_copy_50() {
  makeStorageStub()
  const p = freshProgression()
  for (let i = 0; i < 50; i++) {
    p.recordCopy()
  }
  const snap = p.getCurrentRank()
  assert.strictEqual(snap.copyCount, 50, "copyCount 应该是 50")
  const copy_50 = snap.badges.find((b) => b.id === "copy_50")
  assert.ok(copy_50 && copy_50.unlocked, "copy_50 勋章应解锁")
  const first_copy = snap.badges.find((b) => b.id === "first_copy")
  assert.ok(first_copy && first_copy.unlocked, "first_copy 勋章也应解锁")
  console.log("✓ test_copy_50")
}

// ============ test 5: 损坏 storage 走 default ============
function test_corrupt_storage() {
  makeStorageStub()
  // 写入坏数据
  global.wx.setStorageSync("lbr_progression", "garbage-string-not-object")
  const p = freshProgression()
  const snap = p.getCurrentRank()
  assert.strictEqual(snap.viewCount, 0, "坏数据应被忽略，回到默认 viewCount=0")
  assert.strictEqual(snap.rank.id, "bronze", "坏数据应回到 bronze 默认")
  console.log("✓ test_corrupt_storage")
}

// ============ test 6: 没有 wx 全局也不崩 ============
function test_no_wx_global() {
  delete global.wx
  const p = freshProgression()
  const snap = p.getCurrentRank()
  assert.strictEqual(snap.viewCount, 0, "无 wx 时应该默认 viewCount=0")
  // record 也不崩
  p.recordCardView("test", "cat")
  p.recordCopy()
  console.log("✓ test_no_wx_global")
}

// ============ test 7: viewedCategories 累计 + first_view 勋章 ============
function test_first_view_badge() {
  makeStorageStub()
  const p = freshProgression()
  const r = p.recordCardView("card-1", "2011")
  const firstView = r.badgesUnlocked.find((b) => b.id === "first_view")
  assert.ok(firstView, "首次浏览应当解锁 first_view，实际 unlocked: " + JSON.stringify(r.badgesUnlocked))
  const snap = p.getCurrentRank()
  assert.deepStrictEqual(snap.viewedCategories, ["2011"], "viewedCategories 应包含 '2011'")
  console.log("✓ test_first_view_badge")
}

// ============ run all ============
const tests = [
  test_default_state,
  test_view_dedup,
  test_silver_threshold,
  test_copy_50,
  test_corrupt_storage,
  test_no_wx_global,
  test_first_view_badge
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
  console.error("\nprogression " + failed + "/" + tests.length + " tests FAILED")
  process.exit(1)
} else {
  console.log("\nprogression " + tests.length + "/" + tests.length + " tests ok")
}
