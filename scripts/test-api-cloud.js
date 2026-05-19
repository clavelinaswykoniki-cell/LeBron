/**
 * test-api-cloud.js — 验证 utils/api.js 在云调用模式下的关键契约
 *
 * 覆盖 v2.10 切换到 wx.cloud.callContainer 的核心约定：
 *   1. GET 请求会把 data 拼成 query string 进 path
 *   2. POST 请求 data 进 body
 *   3. header 包含 Content-Type + X-WX-SERVICE（==云托管服务名）
 *   4. config.env == CLOUD_ENV_ID
 *   5. opts.forceHttp 时绕过云调用走 wxRequest
 *   6. 非 2xx 响应抛带 statusCode 的错误
 *   7. cloud fail callback 抛带 cloud: true 的错误
 *   8. opts.timeout 透传到 callContainer
 */

const assert = require("assert")
const path = require("path")

const API_PATH = path.join(__dirname, "..", "miniprogram", "utils", "api.js")

function freshApi() {
  delete require.cache[require.resolve(API_PATH)]
  return require(API_PATH)
}

/**
 * 制造 wx.cloud stub。
 * @param {object} opts
 *   - mode: "success" | "fail-status" | "fail-network"
 *   - statusCode: 用于 success/fail-status
 *   - data: success 时的返回 body
 */
function makeCloudStub(opts) {
  opts = opts || {}
  const captured = { lastCall: null, callCount: 0, wxRequestCount: 0 }

  global.wx = {
    getStorageSync: () => "",
    setStorageSync: () => {},
    cloud: {
      callContainer: function (args) {
        captured.lastCall = args
        captured.callCount += 1
        const mode = opts.mode || "success"
        setImmediate(function () {
          if (mode === "success") {
            args.success && args.success({
              statusCode: opts.statusCode == null ? 200 : opts.statusCode,
              data: opts.data == null ? { ok: true } : opts.data
            })
          } else if (mode === "fail-status") {
            args.success && args.success({
              statusCode: opts.statusCode == null ? 500 : opts.statusCode,
              data: opts.data == null ? { error: "boom" } : opts.data
            })
          } else if (mode === "fail-network") {
            args.fail && args.fail({ errMsg: "callContainer:fail timeout" })
          }
        })
      }
    },
    request: function (args) {
      captured.wxRequestCount += 1
      setImmediate(function () {
        args.success && args.success({ statusCode: 200, data: { fromHttp: true } })
      })
    }
  }
  return captured
}

function cleanup() {
  delete global.wx
}

// ============ test 1: GET 拼 query string + 关键 header ============
async function test_get_query_string_and_header() {
  const captured = makeCloudStub({ mode: "success", data: { items: [] } })
  const api = freshApi()

  const res = await api.get("/api/leaderboard", { limit: 50, foo: "bar" })

  assert.deepStrictEqual(res, { items: [] }, "应返回 callContainer.data")
  const call = captured.lastCall
  assert.ok(call.path.indexOf("/api/leaderboard?") === 0, "path 应以原 path + ? 开头: " + call.path)
  assert.ok(call.path.indexOf("limit=50") >= 0, "query 应包含 limit=50")
  assert.ok(call.path.indexOf("foo=bar") >= 0, "query 应包含 foo=bar")
  assert.strictEqual(call.method, "GET")
  assert.strictEqual(call.header["Content-Type"], "application/json")
  assert.strictEqual(call.header["X-WX-SERVICE"], "express-fjva", "X-WX-SERVICE 必须 = 云托管服务名")
  assert.strictEqual(call.config.env, "prod-d1go3yaske515bdb7", "config.env 必须 = 云托管环境 ID")
  cleanup()
}

// ============ test 2: POST body + path 不变 ============
async function test_post_body() {
  const captured = makeCloudStub({ mode: "success", data: { ok: true, newScore: 250 } })
  const api = freshApi()

  const body = { openid: "abc", score: 100, total: 5, delta: 25 }
  const res = await api.post("/api/pk/submit", body)

  assert.deepStrictEqual(res, { ok: true, newScore: 250 })
  const call = captured.lastCall
  assert.strictEqual(call.path, "/api/pk/submit", "POST path 不应被 query 污染")
  assert.strictEqual(call.method, "POST")
  assert.deepStrictEqual(call.data, body, "POST data 应原样传入 callContainer.data")
  cleanup()
}

// ============ test 3: forceHttp opt-out 绕过云调用 ============
async function test_force_http_opt_out() {
  const captured = makeCloudStub({ mode: "success" })
  const api = freshApi()

  const res = await api.get("/api/leaderboard", { limit: 5 }, { forceHttp: true })

  assert.strictEqual(captured.callCount, 0, "forceHttp 时不应调 callContainer")
  assert.strictEqual(captured.wxRequestCount, 1, "forceHttp 时应调 wx.request")
  assert.deepStrictEqual(res, { fromHttp: true })
  cleanup()
}

// ============ test 4: 非 2xx 抛带 statusCode 的错误 ============
async function test_non_2xx_rejects() {
  makeCloudStub({ mode: "fail-status", statusCode: 503, data: { error: "service unavailable" } })
  const api = freshApi()

  let caught = null
  try {
    await api.post("/api/pk/submit", { openid: "x" })
  } catch (e) {
    caught = e
  }
  assert.ok(caught, "应 reject")
  assert.strictEqual(caught.statusCode, 503)
  assert.ok(caught.message.indexOf("HTTP 503") >= 0, "message 应含 HTTP 503: " + caught.message)
  assert.deepStrictEqual(caught.body, { error: "service unavailable" })
  cleanup()
}

// ============ test 5: cloud fail callback 标记 cloud: true ============
async function test_cloud_fail_callback() {
  makeCloudStub({ mode: "fail-network" })
  const api = freshApi()

  let caught = null
  try {
    await api.get("/api/leaderboard")
  } catch (e) {
    caught = e
  }
  assert.ok(caught, "应 reject")
  assert.strictEqual(caught.cloud, true, "云调用网络错误应标 cloud:true")
  assert.ok(caught.message.indexOf("callContainer:fail") >= 0, "应保留 errMsg: " + caught.message)
  cleanup()
}

// ============ test 6: timeout 透传 ============
async function test_timeout_passthrough() {
  const captured = makeCloudStub({ mode: "success" })
  const api = freshApi()

  await api.get("/api/leaderboard", null, { timeout: 8000 })

  assert.strictEqual(captured.lastCall.timeout, 8000, "opts.timeout 应透传到 callContainer.timeout")
  cleanup()
}

// ============ test 7: requestWithFallback 在云调用失败时走 fallback ============
async function test_request_with_fallback_on_cloud_fail() {
  makeCloudStub({ mode: "fail-network" })
  const api = freshApi()

  const fallback = function (e) {
    return { fromFallback: true, errMsg: e.message }
  }
  const res = await api.requestWithFallback("GET", "/api/leaderboard", null, fallback)

  assert.strictEqual(res.fromFallback, true, "应拿到 fallback 数据")
  assert.ok(res.errMsg.indexOf("callContainer:fail") >= 0)
  cleanup()
}

// ============ test 8: exports 完整（向后兼容） ============
function test_exports_preserved() {
  cleanup()
  const api = freshApi()
  const required = [
    "request", "requestWithFallback", "get", "post",
    "getBaseUrl", "setBaseUrl", "DEFAULT_BASE_URL"
  ]
  required.forEach(function (k) {
    assert.ok(k in api, "module.exports 应保留 " + k + "（向后兼容）")
  })
  // v2.10 新增常量
  assert.strictEqual(api.CLOUD_ENV_ID, "prod-d1go3yaske515bdb7")
  assert.strictEqual(api.CLOUD_SERVICE_NAME, "express-fjva")
}

// ============ runner ============
async function main() {
  const tests = [
    ["test_get_query_string_and_header", test_get_query_string_and_header],
    ["test_post_body", test_post_body],
    ["test_force_http_opt_out", test_force_http_opt_out],
    ["test_non_2xx_rejects", test_non_2xx_rejects],
    ["test_cloud_fail_callback", test_cloud_fail_callback],
    ["test_timeout_passthrough", test_timeout_passthrough],
    ["test_request_with_fallback_on_cloud_fail", test_request_with_fallback_on_cloud_fail],
    ["test_exports_preserved", test_exports_preserved]
  ]

  let pass = 0
  for (const [name, fn] of tests) {
    try {
      await fn()
      console.log("✓ " + name)
      pass += 1
    } catch (e) {
      console.error("✗ " + name + " — " + (e && e.message))
      console.error(e && e.stack)
      process.exit(1)
    }
  }
  console.log("\napi-cloud " + pass + "/" + tests.length + " tests ok")
}

main().catch(function (e) {
  console.error(e && e.stack)
  process.exit(1)
})
