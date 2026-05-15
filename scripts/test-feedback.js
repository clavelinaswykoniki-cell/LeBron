/**
 * scripts/test-feedback.js
 *
 * Unit tests for miniprogram/utils/feedback.js
 * Stubs global.wx so we can verify vibrate + toast behavior in Node.
 */

const assert = require("assert")
const path = require("path")

const FEEDBACK_PATH = path.join(__dirname, "..", "miniprogram", "utils", "feedback.js")

function freshFeedback() {
  delete require.cache[require.resolve(FEEDBACK_PATH)]
  return require(FEEDBACK_PATH)
}

function makeWxStub() {
  const calls = {
    vibrateShort: [],
    showToast: []
  }
  global.wx = {
    vibrateShort: (opts) => {
      calls.vibrateShort.push(opts)
    },
    showToast: (opts) => {
      calls.showToast.push(opts)
    },
    _calls: calls
  }
  return calls
}

function reset() {
  if (global.wx && global.wx._calls) {
    Object.keys(global.wx._calls).forEach((k) => {
      global.wx._calls[k].length = 0
    })
  }
}

// ============ test 1: 默认 tactileFeedback 触发 vibrate + 默认 toast ============
function test_default_feedback() {
  const calls = makeWxStub()
  const { tactileFeedback } = freshFeedback()
  tactileFeedback()
  assert.strictEqual(calls.vibrateShort.length, 1, "默认应触发一次 vibrateShort")
  assert.strictEqual(calls.showToast.length, 1, "默认应弹一次 toast")
  assert.strictEqual(calls.showToast[0].title, "已复制", "默认 toast 标题应为 '已复制'")
  console.log("✓ test_default_feedback")
}

// ============ test 2: 自定义 toast 文案 ============
function test_custom_toast() {
  const calls = makeWxStub()
  const { tactileFeedback } = freshFeedback()
  tactileFeedback({ toast: "整张已复制" })
  assert.strictEqual(calls.showToast.length, 1, "应弹一次 toast")
  assert.strictEqual(calls.showToast[0].title, "整张已复制", "toast 标题应被自定义为 '整张已复制'")
  console.log("✓ test_custom_toast")
}

// ============ test 3: vibrate:false 不触发震动 ============
function test_no_vibrate() {
  const calls = makeWxStub()
  const { tactileFeedback } = freshFeedback()
  tactileFeedback({ vibrate: false })
  assert.strictEqual(calls.vibrateShort.length, 0, "vibrate:false 时不应调 vibrateShort")
  // toast 仍按默认弹出
  assert.strictEqual(calls.showToast.length, 1, "toast 仍按默认弹出")
  console.log("✓ test_no_vibrate")
}

// ============ test 4: toast 为空字符串不弹 ============
function test_empty_toast() {
  const calls = makeWxStub()
  const { tactileFeedback } = freshFeedback()
  tactileFeedback({ toast: "" })
  assert.strictEqual(calls.showToast.length, 0, "toast='' 时不应弹 toast")
  // vibrate 默认仍 true
  assert.strictEqual(calls.vibrateShort.length, 1, "vibrate 默认仍 true，应震动一次")
  console.log("✓ test_empty_toast")
}

// ============ test 5: 没有 global.wx 时不崩 ============
function test_no_wx_global() {
  delete global.wx
  const { tactileFeedback } = freshFeedback()
  // 调用不应抛错
  tactileFeedback()
  tactileFeedback({ toast: "x", vibrate: true })
  tactileFeedback({ toast: "", vibrate: false })
  assert.ok(true, "无 wx 也不崩")
  console.log("✓ test_no_wx_global")
}

// ============ test 6: duration 透传 ============
function test_duration_passthrough() {
  const calls = makeWxStub()
  const { tactileFeedback } = freshFeedback()
  tactileFeedback({ toast: "hi", duration: 999 })
  assert.strictEqual(calls.showToast.length, 1, "应弹一次 toast")
  assert.strictEqual(calls.showToast[0].duration, 999, "duration 应被透传为 999")
  console.log("✓ test_duration_passthrough")
}

// ============ run all ============
const tests = [
  test_default_feedback,
  test_custom_toast,
  test_no_vibrate,
  test_empty_toast,
  test_no_wx_global,
  test_duration_passthrough
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
  console.error("\nfeedback " + failed + "/" + tests.length + " tests FAILED")
  process.exit(1)
} else {
  console.log("\nfeedback " + tests.length + "/" + tests.length + " tests ok")
}
