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
  let body

  if (m === "GET") {
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
      method: m,
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
 * 带降级的请求：失败时调 fallback(error) 拿降级数据，console.warn 不打扰用户。
 * fallback 没传或抛错则继续 reject。
 *
 * @param {string}   method
 * @param {string}   path
 * @param {object}   data
 * @param {function} fallback
 * @param {object}   opts
 * @returns {Promise<any>}
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
 *   get("/path", { timeout: 8000 })        // 没有 query，第二个参数是 opts —— 不支持，请用 3 参形式
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
  DEFAULT_BASE_URL: DEFAULT_BASE_URL
}
