/**
 * api.js — 统一封装 API 调用（双模式）
 *
 * v2.10 起优先使用 wx.cloud.callContainer（云调用云托管）：
 *   - 不需要 HTTPS 白名单
 *   - 不需要域名 + ICP 备案
 *   - 微信平台禁止云托管默认域名 *.sh.run.tcloudbase.com 作为正式环境用
 *
 * 设计目标：
 *   1. 优先 wx.cloud.callContainer，fallback wx.request（公网 HTTPS）
 *   2. BASE_URL 仍可切换：开发期 http://localhost:3000，备案后改 https://你的域名.cn
 *   3. 所有调用 5s 超时
 *   4. 失败时通过 requestWithFallback 优雅降级到本地 mock
 *
 * 用法（不变）：
 *   const api = require("../utils/api")
 *   const data = await api.get("/api/leaderboard?limit=50")
 *   const result = await api.post("/api/pk/submit", { openid, score, total, delta })
 *
 *   // 显式禁用云调用（debug 或本地 mock 用）
 *   await api.get("/api/leaderboard", { limit: 50 }, { forceHttp: true })
 */

// 云托管环境 + 服务名（未来改环境只需改这 2 行）
const CLOUD_ENV_ID = "prod-d1go3yaske515bdb7"
const CLOUD_SERVICE_NAME = "express-fjva"

const DEFAULT_BASE_URL = "https://express-fjva-259825-6-1434727404.sh.run.tcloudbase.com"
const BASE_URL_STORAGE_KEY = "lbr_api_base_url"
const DEFAULT_TIMEOUT_MS = 5000

function _hasWxStorage() {
  return typeof wx !== "undefined"
    && typeof wx.getStorageSync === "function"
    && typeof wx.setStorageSync === "function"
}

function getBaseUrl() {
  try {
    if (typeof wx === "undefined" || typeof wx.getStorageSync !== "function") {
      return DEFAULT_BASE_URL
    }
    const cached = wx.getStorageSync(BASE_URL_STORAGE_KEY)
    if (typeof cached === "string" && cached) return cached
    return DEFAULT_BASE_URL
  } catch (e) {
    return DEFAULT_BASE_URL
  }
}

function setBaseUrl(url) {
  try {
    if (!_hasWxStorage()) return
    wx.setStorageSync(BASE_URL_STORAGE_KEY, url)
  } catch (e) {
    // silent
  }
}

/** 把 plain object 拼成 url query string；跳过 undefined/null/NaN */
function _toQueryString(data) {
  const parts = []
  const keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const v = data[k]
    if (v === undefined || v === null) continue
    if (typeof v === "number" && isNaN(v)) continue
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v))
  }
  return parts.join("&")
}

/**
 * 判断是否可以走云调用。
 * - opts.forceHttp 显式 opt-out 时返回 false
 * - 必须 wx.cloud.callContainer 存在
 */
function canUseCloudCall(opts) {
  if (opts && opts.forceHttp) return false

  // 开发期 kill switch：在 wx storage 设 lbr_disable_cloud=true 可关掉云调用，强制走 wx.request fallback。
  // 用法：在开发者工具 Console 跑 wx.setStorageSync('lbr_disable_cloud', true) → 重新编译
  // 关联好云托管环境后跑 wx.setStorageSync('lbr_disable_cloud', false) 恢复。
  try {
    if (typeof wx !== "undefined" && typeof wx.getStorageSync === "function") {
      if (wx.getStorageSync("lbr_disable_cloud") === true) return false
    }
  } catch (e) {}

  return typeof wx !== "undefined"
    && wx.cloud
    && typeof wx.cloud.callContainer === "function"
}

/**
 * 云调用云托管：wx.cloud.callContainer
 *
 * 注意：
 *   - GET 时 data 要拼成 query string 放进 path（callContainer 的 data 不会自动作为 query）
 *   - POST 时 data 作为 body 传
 *   - header.X-WX-SERVICE 必须 == 云托管服务名（这是 callContainer 路由到具体服务的关键）
 *   - timeout 参数在新版基础库支持；老版本忽略不报错
 */
function cloudCall(method, path, data, opts) {
  const timeout = (opts && opts.timeout) || DEFAULT_TIMEOUT_MS

  let actualPath = path
  let body

  if (method === "GET") {
    if (data && typeof data === "object") {
      const qs = _toQueryString(data)
      if (qs) actualPath += (path.indexOf("?") >= 0 ? "&" : "?") + qs
    }
  } else {
    body = data || {}
  }

  return new Promise(function (resolve, reject) {
    wx.cloud.callContainer({
      config: { env: CLOUD_ENV_ID },
      path: actualPath,
      method: method,
      header: {
        "Content-Type": "application/json",
        "X-WX-SERVICE": CLOUD_SERVICE_NAME
      },
      data: body,
      timeout: timeout,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const serverErr = res.data && res.data.error
        const err = new Error("HTTP " + res.statusCode + " " + (serverErr || "request failed"))
        err.statusCode = res.statusCode
        err.body = res.data
        reject(err)
      },
      fail: function (err) {
        const e = new Error(err && err.errMsg ? err.errMsg : "cloud call failed")
        e.cloud = true
        reject(e)
      }
    })
  })
}

/**
 * 传统公网 HTTPS：wx.request
 * 保留作为云调用不可用时的 fallback（unit test、开发期 localhost、forceHttp 显式切换）
 */
function wxRequest(method, path, data, opts) {
  const timeout = (opts && opts.timeout) || DEFAULT_TIMEOUT_MS
  const baseUrl = (opts && opts.baseUrl) || getBaseUrl()

  let url = baseUrl + path
  let body

  if (method === "GET") {
    if (data && typeof data === "object") {
      const qs = _toQueryString(data)
      if (qs) url += (url.indexOf("?") >= 0 ? "&" : "?") + qs
    }
  } else {
    body = data || {}
  }

  return new Promise(function (resolve, reject) {
    if (typeof wx === "undefined" || typeof wx.request !== "function") {
      reject(new Error("wx.request unavailable (非小程序环境)"))
      return
    }
    wx.request({
      url: url,
      method: method,
      data: body,
      header: { "Content-Type": "application/json" },
      timeout: timeout,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const serverErr = res.data && res.data.error
        const err = new Error("HTTP " + res.statusCode + " " + (serverErr || "request failed"))
        err.statusCode = res.statusCode
        err.body = res.data
        reject(err)
      },
      fail: function (err) {
        const e = new Error(err && err.errMsg ? err.errMsg : "network error")
        e.network = true
        reject(e)
      }
    })
  })
}

/**
 * 基础请求：双模式分发器。
 * 优先 wx.cloud.callContainer，不可用时 fallback 到 wx.request。
 *
 * @param {string} method "GET" | "POST"
 * @param {string} path   "/api/leaderboard" 之类
 * @param {object} data   GET 请求时如果不为 null 会 stringify 进 query；POST 时作为 body
 * @param {object} opts   { timeout?, baseUrl?, forceHttp? }
 * @returns {Promise<any>}
 */
function request(method, path, data, opts) {
  opts = opts || {}
  const m = String(method || "GET").toUpperCase()

  if (canUseCloudCall(opts)) {
    return cloudCall(m, path, data, opts)
  }
  return wxRequest(m, path, data, opts)
}

/**
 * 带降级的请求：失败时调 fallback(error) 拿降级数据，console.warn 不打扰用户。
 * fallback 没传或抛错则继续 reject。
 */
async function requestWithFallback(method, path, data, fallback, opts) {
  try {
    return await request(method, path, data, opts)
  } catch (e) {
    console.warn("[api] " + (method || "GET") + " " + path + " 失败: " + (e && e.message))
    if (typeof fallback === "function") {
      try {
        return fallback(e)
      } catch (fbErr) {
        console.warn("[api] fallback 也炸了: " + (fbErr && fbErr.message))
        throw fbErr
      }
    }
    throw e
  }
}

/**
 * 兼容两种 GET 调用：
 *   get("/path")
 *   get("/path", { limit: 50 })            // 第二个参数是 query 对象
 *   get("/path", { limit: 50 }, opts)
 *
 * 历史用法：有的 caller 直接 get("/path", optsObj)，我们靠"对象但没有 query 风格 key"难以区分，
 * 因此约定：只要传了第二个对象参数，都当作 queryData；opts 必须显式作为第三个参数。
 */
function get(path, queryData, opts) {
  if (queryData && typeof queryData === "object" && !Array.isArray(queryData)) {
    return request("GET", path, queryData, opts)
  }
  return request("GET", path, null, opts)
}

function post(path, data, opts) {
  return request("POST", path, data, opts)
}

module.exports = {
  request: request,
  requestWithFallback: requestWithFallback,
  get: get,
  post: post,
  getBaseUrl: getBaseUrl,
  setBaseUrl: setBaseUrl,
  DEFAULT_BASE_URL: DEFAULT_BASE_URL,
  CLOUD_ENV_ID: CLOUD_ENV_ID,
  CLOUD_SERVICE_NAME: CLOUD_SERVICE_NAME
}
