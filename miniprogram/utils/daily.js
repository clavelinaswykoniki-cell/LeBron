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
  var d = new Date()
  d.setDate(d.getDate() - 1)
  return formatYMD(d)
}

/* ----------------------------- 哈希工具 ----------------------------- */

/**
 * djb2 变体：把日期字符串映射为正整数
 * 输入 "2026-05-15" -> 稳定 hash
 */
function hashString(str) {
  var h = 5381
  for (var i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0
  }
  // 转为非负
  return h < 0 ? -h : h
}

/* ----------------------------- 存储封装 ----------------------------- */

function safeGet(key) {
  try {
    if (typeof wx !== "undefined" && wx && typeof wx.getStorageSync === "function") {
      var raw = wx.getStorageSync(key)
      if (!raw) return null
      if (typeof raw === "string") {
        try { return JSON.parse(raw) } catch (e) { return null }
      }
      return raw
    }
  } catch (e) {
    return null
  }
  return null
}

function safeSet(key, value) {
  try {
    if (typeof wx !== "undefined" && wx && typeof wx.setStorageSync === "function") {
      wx.setStorageSync(key, value)
      return true
    }
  } catch (e) {
    return false
  }
  return false
}

/* ----------------------------- 主 API ----------------------------- */

/**
 * 按今天日期挑选一张固定卡片，同一天稳定
 * @returns {object|null} 完整 card 对象，arsenal 为空时返回 null
 */
function getTodayCard() {
  var cards = (arsenal && arsenal.cards) ? arsenal.cards : []
  if (!cards || cards.length === 0) return null
  var idx = hashString(getTodayStr()) % cards.length
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
  var today = getTodayStr()
  var prev = safeGet(STORAGE_KEY) || { lastDate: "", streak: 0, totalDays: 0 }

  if (prev.lastDate === today) {
    return {
      streak: prev.streak || 0,
      totalDays: prev.totalDays || 0,
      isNewDay: false,
      lastDate: prev.lastDate
    }
  }

  var nextStreak
  if (prev.lastDate === getYesterdayStr()) {
    nextStreak = (prev.streak || 0) + 1
  } else {
    nextStreak = 1
  }
  var nextTotal = (prev.totalDays || 0) + 1

  var next = {
    lastDate: today,
    streak: nextStreak,
    totalDays: nextTotal
  }
  safeSet(STORAGE_KEY, next)

  return {
    streak: nextStreak,
    totalDays: nextTotal,
    isNewDay: true,
    lastDate: today
  }
}

/**
 * 只读取签到统计，不修改
 * @returns {{ streak: number, totalDays: number, lastDate: string, todaySigned: boolean }}
 */
function getCheckinStats() {
  var prev = safeGet(STORAGE_KEY) || { lastDate: "", streak: 0, totalDays: 0 }
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
