/**
 * @file utils/daily.js
 * @description 每日一战工具：按日期哈希挑选当日固定卡片 + 本地签到统计
 *
 * 设计要点：
 *   - getTodayCard(): 同一天打开返回同一张卡（日期字符串哈希 mod cards.length）
 *   - recordCheckin(): 写入 wx 本地存储 lbr_daily_checkin = { lastDate, streak, totalDays }
 *       昨天有签到 -> streak += 1
 *       否则 -> streak 重置为 1
 *       今天已签到 -> 不重复记账
 *   - getCheckinStats(): 只读，不写入，供页面渲染
 *   - 全部 wx.storage 调用 try/catch；非微信环境（无 wx 全局）也能安全 require / 调用
 */

const arsenal = require("../data/arsenal")
const api = require("./api")
let userProfile = null
try { userProfile = require("./userProfile") } catch (e) { userProfile = null }

const STORAGE_KEY = "lbr_daily_checkin"

/* ----------------------------- 日期工具 ----------------------------- */

function pad2(n) {
  return n < 10 ? "0" + n : "" + n
}

function formatYMD(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate())
}

function getTodayStr() {
  return formatYMD(new Date())
}

function getYesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatYMD(d)
}

/* ----------------------------- 哈希工具 ----------------------------- */

/**
 * djb2 变体：把日期字符串映射为正整数
 * 输入 "2026-05-15" -> 稳定 hash
 */
function hashString(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0
  }
  return h < 0 ? -h : h
}

/* ----------------------------- 存储封装 ----------------------------- */

/**
 * wx.setStorageSync 接受对象时会原样存对象，读出来还是对象；
 * 历史版本里有过一个 JSON.parse 分支，但小程序原生 storage 不会把对象自动 stringify，
 * 所以那条分支在 v2.5+ 是死代码，移除掉。
 */
function safeGet(key) {
  try {
    if (typeof wx === "undefined" || !wx || typeof wx.getStorageSync !== "function") return null
    const raw = wx.getStorageSync(key)
    if (!raw) return null
    return (typeof raw === "object") ? raw : null
  } catch (e) {
    return null
  }
}

function safeSet(key, value) {
  try {
    if (typeof wx === "undefined" || !wx || typeof wx.setStorageSync !== "function") return false
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    return false
  }
}

/* ----------------------------- 主 API ----------------------------- */

/**
 * 按今天日期挑选一张固定卡片，同一天稳定
 * @returns {object|null} 完整 card 对象，arsenal 为空时返回 null
 */
function getTodayCard() {
  const cards = (arsenal && arsenal.cards) ? arsenal.cards : []
  if (!cards.length) return null
  const idx = hashString(getTodayStr()) % cards.length
  return cards[idx]
}

/**
 * 记录今日签到
 * - 今天已签到 -> 不变动，isNewDay=false
 * - 昨天签到 -> streak+1
 * - 否则 -> streak 重置为 1
 * @returns {{ streak: number, totalDays: number, isNewDay: boolean, lastDate: string }}
 */
function recordCheckin() {
  const today = getTodayStr()
  const prev = safeGet(STORAGE_KEY) || { lastDate: "", streak: 0, totalDays: 0 }

  if (prev.lastDate === today) {
    return {
      streak: prev.streak || 0,
      totalDays: prev.totalDays || 0,
      isNewDay: false,
      lastDate: prev.lastDate
    }
  }

  const nextStreak = (prev.lastDate === getYesterdayStr())
    ? (prev.streak || 0) + 1
    : 1
  const nextTotal = (prev.totalDays || 0) + 1

  const next = { lastDate: today, streak: nextStreak, totalDays: nextTotal }
  safeSet(STORAGE_KEY, next)

  // fire-and-forget 同步到后端，失败不影响本地体验
  // 用 try/catch 包住整段，确保 userProfile / api 任一环节失败都不会抛
  try {
    if (userProfile && typeof userProfile.getProfile === "function") {
      const profile = userProfile.getProfile()
      const card = getTodayCard()
      api.post("/api/daily/checkin", {
        openid: profile.openid,
        card_id: card && card.id ? String(card.id) : undefined
      }).catch(function (err) {
        console.warn("[daily] checkin 后端同步失败（本地已记）:", err && err.message)
      })
    }
  } catch (e) {
    // silent
  }

  return {
    streak: nextStreak,
    totalDays: nextTotal,
    isNewDay: true,
    lastDate: today
  }
}

/**
 * 只读取签到统计，不修改
 */
function getCheckinStats() {
  const prev = safeGet(STORAGE_KEY) || { lastDate: "", streak: 0, totalDays: 0 }
  return {
    streak: prev.streak || 0,
    totalDays: prev.totalDays || 0,
    lastDate: prev.lastDate || "",
    todaySigned: prev.lastDate === getTodayStr()
  }
}

module.exports = {
  getTodayCard: getTodayCard,
  recordCheckin: recordCheckin,
  getCheckinStats: getCheckinStats,
  // 内部工具导出便于测试
  _hashString: hashString,
  _getTodayStr: getTodayStr,
  _STORAGE_KEY: STORAGE_KEY
}
