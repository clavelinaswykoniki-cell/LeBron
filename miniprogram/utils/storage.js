/**
 * 搜索历史 + 收藏 本地存储工具。
 */

const SEARCH_HISTORY_KEY = "lbr_search_history"
const FAVORITES_KEY = "lbr_favorites"
const MAX_HISTORY = 20

function _safeGet(key, defaultVal) {
  try {
    if (typeof wx === "undefined" || !wx.getStorageSync) return defaultVal
    const v = wx.getStorageSync(key)
    return v || defaultVal
  } catch (e) {
    return defaultVal
  }
}

function _safeSet(key, val) {
  try {
    if (typeof wx === "undefined" || !wx.setStorageSync) return
    wx.setStorageSync(key, val)
  } catch (e) {}
}

/** 记录一次搜索（去重 + 截断到 MAX_HISTORY） */
function recordSearchHistory(query) {
  if (!query || typeof query !== "string") return
  const q = query.trim()
  if (!q) return
  const history = _safeGet(SEARCH_HISTORY_KEY, [])
  const filtered = history.filter(item => item.query !== q)
  filtered.unshift({ query: q, at: Date.now() })
  _safeSet(SEARCH_HISTORY_KEY, filtered.slice(0, MAX_HISTORY))
}

/** 返回搜索历史数组（最近在前） */
function getSearchHistory() {
  return _safeGet(SEARCH_HISTORY_KEY, [])
}

/** 清空搜索历史 */
function clearSearchHistory() {
  _safeSet(SEARCH_HISTORY_KEY, [])
}

/** 切换收藏状态（已收藏 → 取消；未收藏 → 收藏） */
function toggleFavorite(cardId, cardSnapshot) {
  if (!cardId) return false
  const favs = _safeGet(FAVORITES_KEY, [])
  const idx = favs.findIndex(f => f.id === cardId)
  let nowFavorited
  if (idx >= 0) {
    favs.splice(idx, 1)
    nowFavorited = false
  } else {
    favs.unshift({ id: cardId, at: Date.now(), snapshot: cardSnapshot || null })
    nowFavorited = true
  }
  _safeSet(FAVORITES_KEY, favs)
  return nowFavorited
}

/** 返回收藏数组（最近在前） */
function getFavorites() {
  return _safeGet(FAVORITES_KEY, [])
}

/** 是否已收藏某张卡 */
function isFavorited(cardId) {
  if (!cardId) return false
  const favs = _safeGet(FAVORITES_KEY, [])
  return favs.some(f => f.id === cardId)
}

module.exports = {
  recordSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  toggleFavorite,
  getFavorites,
  isFavorited,
  SEARCH_HISTORY_KEY,
  FAVORITES_KEY
}
