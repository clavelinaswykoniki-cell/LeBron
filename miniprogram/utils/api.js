/**
 * api.js — 统一封装 wx.request
 *
 * 设计目标：
 *   1. BASE_URL 可切换：开发期 http://localhost:3000，备案后改 https://你的域名.cn
 *      切换方式：调 setBaseUrl() 或在小程序里改一次 wx.setStorageSync("lbr_api_base_url", ...)
 *   2. 所有调用 5s 超时（避免菊花转半天）
 *   3. 失败时通过 requestWithFallback 优雅降级到本地 mock，用户感知是「网络慢」不是「崩了」
 *
 * 用法：
 *   const api = require("../utils/api")
 *   const data = await api.get("/api/leaderboard?limit=50")
 *   const result = await api.post("/api/pk/submit", { openid, score, total, delta })
 *
 *   // 失败时回退到本地数据
 *   const leaderboard = await api.requestWithFallback(
 *     "GET", "/api/leaderboard", null,
 *     function () { return _getLocalMockLeaderboard() }
 *   )
 */

const DEFAULT_BASE_URL = "https://express-5hpi-259564-8-1434513466.sh.run.tcloudbase.com"
const BASE_URL_STORAGE_KEY = "lbr_api_base_url"
const DEFAULT_TIMEOUT_MS = 5000

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
    if (typeof wx === "undefined" || typeof wx.setStorageSync !== "function") return
    wx.setStorageSync(BASE_URL_STORAGE_KEY, url)
  } catch (e) {
    // silent
  }
}

/**
 * 基础请求：成功返回 res.data，失败 reject。
 *
 * @param {string} method "GET" | "POST"
 * @param {string} path   "/api/leaderboard" 之类
 * @param {object} data   GET 请求时如果不为 null 会 stringify 进 query；POST 时作为 body
 * @param {object} opts   { timeout?, baseUrl? }
 * @returns {Promise<any>}
 */
function request(method, path, data, opts) {
  opts = opts || {}
  const m = String(method || "GET").toUpperCase()
  const timeout = opts.timeout || DEFAULT_TIMEOUT_MS
  const baseUrl = opts.baseUrl || getBaseUrl()

  let url = baseUrl + path
  let body = undefined

  if (m === "GET" && data && typeof data === "object") {
    const qs = Object.keys(data)
      .filter(function (k) { return data[k] !== undefined && data[k] !== null })
      .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]) })
      .join("&")
    if (qs) url += (url.indexOf("?") >= 0 ? "&" : "?") + qs
  } else if (m !== "GET") {
    body = data || {}
  }

  return new Promise(function (resolve, reject) {
    if (typeof wx === "undefined" || typeof wx.request !== "function") {
      reject(new Error("wx.request unavailable (非小程序环境)"))
      return
    }
    wx.request({
      url: url,
      method: m,
      data: body,
      header: { "Content-Type": "application/json" },
      timeout: timeout,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          const err = new Error("HTTP " + res.statusCode + " " + (res.data && res.data.error ? res.data.error : "request failed"))
          err.statusCode = res.statusCode
          err.body = res.data
          reject(err)
        }
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
 * 带降级的请求：失败时调 fallback(error) 拿降级数据，console.warn 不打扰用户。
 * fallback 没传或抛错则继续 reject。
 *
 * @param {string} method
 * @param {string} path
 * @param {object} data
 * @param {function} fallback
 * @param {object} opts
 * @returns {Promise<any>}
 */
async function requestWithFallback(method, path, data, fallback, opts) {
  try {
    return await request(method, path, data, opts)
  } catch (e) {
    console.warn("[api] " + (method || "GET") + " " + path + " 失败: " + e.message)
    if (typeof fallback === "function") {
      try {
        return fallback(e)
      } catch (fbErr) {
        console.warn("[api] fallback 也炸了: " + fbErr.message)
        throw fbErr
      }
    }
    throw e
  }
}

module.exports = {
  request: request,
  requestWithFallback: requestWithFallback,
  get: function (path, queryData, opts) {
    // 兼容两种调用：get("/path") 和 get("/path", {limit:50})
    if (typeof queryData === "object" && queryData && !Array.isArray(queryData) && !opts) {
      return request("GET", path, queryData, undefined)
    }
    return request("GET", path, null, opts || queryData)
  },
  post: function (path, data, opts) {
    return request("POST", path, data, opts)
  },
  getBaseUrl: getBaseUrl,
  setBaseUrl: setBaseUrl,
  DEFAULT_BASE_URL: DEFAULT_BASE_URL
}
