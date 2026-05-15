/**
 * scripts/test-safety.js
 *
 * Unit tests for miniprogram/utils/safety.js
 * Stubs global.wx so we can verify the wx API calls in Node.
 */

const assert = require("assert")
const path = require("path")

const SAFETY_PATH = path.join(__dirname, "..", "miniprogram", "utils", "safety.js")

function freshSafety() {
  delete require.cache[require.resolve(SAFETY_PATH)]
  return require(SAFETY_PATH)
}

function makeWxStub() {
  const calls = {
    getStorageSync: [],
    setStorageSync: [],
    setClipboardData: [],
    showToast: [],
    navigateTo: []
  }
  global.wx = {
    getStorageSync: (key) => {
      calls.getStorageSync.push(key)
      return ""
    },
    setStorageSync: (key, val) => {
      calls.setStorageSync.push({ key, val })
    },
    setClipboardData: (opts) => {
      calls.setClipboardData.push(opts)
      // mimic immediate success path
      if (opts && typeof opts.success === "function") opts.success()
    },
    showToast: (opts) => {
      calls.showToast.push(opts)
    },
    navigateTo: (opts) => {
      calls.navigateTo.push(opts)
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

// ============ test 1: safeCopy("") 不复制，弹"没有可复制内容" ============
function test_safe_copy_empty() {
  const calls = makeWxStub()
  const { safeCopy } = freshSafety()
  safeCopy("")
  assert.strictEqual(calls.setClipboardData.length, 0, "空字符串不应调用 setClipboardData")
  assert.strictEqual(calls.showToast.length, 1, "应弹一次 toast")
  assert.ok(
    calls.showToast[0].title.indexOf("没有可复制内容") >= 0,
    "toast 文案应包含 '没有可复制内容'，实际：" + calls.showToast[0].title
  )
  console.log("✓ test_safe_copy_empty")
}

// ============ test 2: safeCopy("hello") 调用 setClipboardData ============
function test_safe_copy_hello() {
  const calls = makeWxStub()
  const { safeCopy } = freshSafety()
  safeCopy("hello")
  assert.strictEqual(calls.setClipboardData.length, 1, "应调用 setClipboardData 一次")
  assert.strictEqual(calls.setClipboardData[0].data, "hello", "data 应为 hello")
  // 默认 success 回调会弹 toast，标题应为 '已复制'
  assert.ok(
    calls.showToast.length >= 1 && calls.showToast[0].title === "已复制",
    "默认 successMsg 应该是 '已复制'，实际：" + (calls.showToast[0] && calls.showToast[0].title)
  )
  console.log("✓ test_safe_copy_hello")
}

// ============ test 3: safeCopy("hello", "已复制完") 自定义 success 文案 ============
function test_safe_copy_custom_success() {
  const calls = makeWxStub()
  const { safeCopy } = freshSafety()
  safeCopy("hello", "已复制完")
  assert.strictEqual(calls.setClipboardData.length, 1, "应调用 setClipboardData 一次")
  assert.strictEqual(calls.setClipboardData[0].data, "hello", "data 应为 hello")
  assert.ok(calls.showToast.length >= 1, "至少弹一次 toast")
  assert.strictEqual(calls.showToast[0].title, "已复制完", "自定义 successMsg 未生效")
  console.log("✓ test_safe_copy_custom_success")
}

// ============ test 4: safeShowEmptyQuery 弹空查询提示 ============
function test_safe_show_empty_query() {
  const calls = makeWxStub()
  const { safeShowEmptyQuery } = freshSafety()
  safeShowEmptyQuery()
  assert.strictEqual(calls.showToast.length, 1, "应弹一次 toast")
  const title = calls.showToast[0].title || ""
  const ok = title.indexOf("8分") >= 0 || title.indexOf("Excel球王") >= 0
  assert.ok(ok, "空查询提示应包含 '8分' 或 'Excel球王'，实际：" + title)
  console.log("✓ test_safe_show_empty_query")
}

// ============ test 5: safeNavigate 转发 url 给 wx.navigateTo ============
function test_safe_navigate() {
  const calls = makeWxStub()
  const { safeNavigate } = freshSafety()
  safeNavigate("/pages/x/x")
  assert.strictEqual(calls.navigateTo.length, 1, "应调用 navigateTo 一次")
  assert.strictEqual(calls.navigateTo[0].url, "/pages/x/x", "navigateTo url 不匹配")
  console.log("✓ test_safe_navigate")
}

// ============ test 6: safeCopy success 回调触发 success icon ============
function test_safe_copy_success_icon() {
  const calls = makeWxStub()
  const { safeCopy } = freshSafety()
  safeCopy("xyz")
  assert.ok(calls.showToast.length >= 1, "应弹 success toast")
  assert.strictEqual(calls.showToast[0].icon, "success", "success toast 应使用 success icon")
  console.log("✓ test_safe_copy_success_icon")
}

// ============ run all ============
const tests = [
  test_safe_copy_empty,
  test_safe_copy_hello,
  test_safe_copy_custom_success,
  test_safe_show_empty_query,
  test_safe_navigate,
  test_safe_copy_success_icon
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
  console.error("\nsafety " + failed + "/" + tests.length + " tests FAILED")
  process.exit(1)
} else {
  console.log("\nsafety " + tests.length + "/" + tests.length + " tests ok")
}
