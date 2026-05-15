/**
 * test-duel.js — 段位对抗核心单测
 */

const assert = require("assert")
const path = require("path")

const DUEL_PATH = path.join(__dirname, "..", "miniprogram", "utils", "duel.js")

function freshDuel() {
  delete require.cache[require.resolve(DUEL_PATH)]
  return require(DUEL_PATH)
}

function makeWxStub() {
  const data = {}
  global.wx = {
    getStorageSync: (k) => (k in data ? data[k] : ""),
    setStorageSync: (k, v) => { data[k] = v },
    _dump: () => data
  }
}

function reset() {
  if (global.wx && global.wx._dump) {
    const s = global.wx._dump()
    Object.keys(s).forEach((k) => delete s[k])
  }
}

// ============ test 1: RANK_TIERS 边界 ============
function test_rank_tiers_boundaries() {
  makeWxStub()
  const d = freshDuel()
  assert.strictEqual(d.RANK_TIERS.length, 5, "5 个段位")
  assert.strictEqual(d.RANK_TIERS[0].id, "bronze")
  assert.strictEqual(d.RANK_TIERS[4].id, "king")
  // 升序检查
  for (let i = 1; i < d.RANK_TIERS.length; i++) {
    assert.ok(d.RANK_TIERS[i].threshold > d.RANK_TIERS[i - 1].threshold, "threshold 必须升序")
  }
  console.log("✓ test_rank_tiers_boundaries")
}

// ============ test 2: getLeaderboard 返回 101 entries 且含 me ============
function test_leaderboard_includes_me() {
  makeWxStub()
  const d = freshDuel()
  const lb = d.getLeaderboard()
  assert.strictEqual(lb.length, 101, "100 mock + 我 = 101，实际 " + lb.length)
  const meCount = lb.filter((p) => p.isMe).length
  assert.strictEqual(meCount, 1, "应该有且仅有 1 个 isMe")
  console.log("✓ test_leaderboard_includes_me")
}

// ============ test 3: startMatch 5 题 4 选项 ============
function test_start_match_shape() {
  makeWxStub()
  const d = freshDuel()
  const m = d.startMatch()
  assert.ok(m.matchId, "matchId 必须存在")
  assert.strictEqual(m.questions.length, 5, "应该 5 题")
  m.questions.forEach((q, i) => {
    assert.ok(q.cardId, "题 " + i + " 缺 cardId")
    assert.ok(q.prompt, "题 " + i + " 缺 prompt")
    assert.strictEqual(q.options.length, 4, "题 " + i + " options 应该 4 个")
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, "题 " + i + " correctIndex 越界")
    assert.strictEqual(q.options[q.correctIndex], q.options[q.correctIndex], "correctIndex 对应的选项必须存在")
  })
  console.log("✓ test_start_match_shape")
}

// ============ test 4: submitMatch rankChange 阈值 ============
function test_submit_rank_change() {
  makeWxStub()
  const d = freshDuel()
  const m = d.startMatch()
  // 全错 → score 0 → rankChange -10
  const r0 = d.submitMatch(m.matchId, [99, 99, 99, 99, 99], m.questions)
  assert.strictEqual(r0.score, 0, "全错应 0 分")
  assert.strictEqual(r0.rankChange, -10, "0 分应 -10")

  // 全对 → score 100 → rankChange +30
  reset()
  const m2 = freshDuel().startMatch()
  const allCorrect = m2.questions.map((q) => q.correctIndex)
  const r1 = freshDuel().submitMatch(m2.matchId, allCorrect, m2.questions)
  assert.ok(r1.score >= 80, "全对应 >= 80 分（实际 " + r1.score + "）")
  assert.strictEqual(r1.rankChange, 30, "80+ 分应 +30，实际 " + r1.rankChange)
  console.log("✓ test_submit_rank_change")
}

// ============ test 5: getDuelHistory 损坏 storage 兜底 ============
function test_corrupt_history() {
  makeWxStub()
  global.wx.getStorageSync = () => "garbage-string"
  const d = freshDuel()
  assert.deepStrictEqual(d.getDuelHistory(), [], "损坏数据返回空数组")
  console.log("✓ test_corrupt_history")
}

// ============ test 6: getStats 处理 null score ============
function test_stats_null_score_safe() {
  makeWxStub()
  global.wx.setStorageSync("lbr_duel_history", [
    { matchId: "m1", score: 80 },
    { matchId: "m2", score: null },
    { matchId: "m3", score: 40 },
    { matchId: "m4" /* no score */ }
  ])
  const d = freshDuel()
  const s = d.getStats()
  assert.strictEqual(s.total, 4, "total 应是历史总数")
  assert.strictEqual(s.best, 80, "best 应是 80")
  assert.strictEqual(s.avg, 60, "avg 应是 (80+40)/2 = 60")
  assert.strictEqual(s.wins, 1, "wins 应是 1")
  console.log("✓ test_stats_null_score_safe")
}

// ============ test 7: 无 wx 全局不崩 ============
function test_no_wx_global() {
  delete global.wx
  const d = freshDuel()
  assert.deepStrictEqual(d.getDuelHistory(), [])
  const stats = d.getStats()
  assert.strictEqual(stats.total, 0)
  const m = d.startMatch()
  assert.ok(m.questions.length > 0, "无 wx 仍应能 startMatch（基于内存 arsenal）")
  console.log("✓ test_no_wx_global")
}

// ============ test 8: leaderboard 排序与 rank 重新编号 ============
function test_leaderboard_sorted() {
  makeWxStub()
  const d = freshDuel()
  const lb = d.getLeaderboard()
  for (let i = 1; i < lb.length; i++) {
    assert.ok(lb[i - 1].score >= lb[i].score, "排行榜必须按 score 降序")
    assert.strictEqual(lb[i].rank, i + 1, "rank 必须连续")
  }
  console.log("✓ test_leaderboard_sorted")
}

// ============ run ============
const tests = [
  test_rank_tiers_boundaries,
  test_leaderboard_includes_me,
  test_start_match_shape,
  test_submit_rank_change,
  test_corrupt_history,
  test_stats_null_score_safe,
  test_no_wx_global,
  test_leaderboard_sorted
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
  console.error("\nduel " + failed + "/" + tests.length + " tests FAILED")
  process.exit(1)
} else {
  console.log("\nduel " + tests.length + "/" + tests.length + " tests ok")
}
