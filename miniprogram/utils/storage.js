/**
 * 搜索历史 + 收藏 本地存储工具。
 *
 * 设计：
 *   - 所有 wx.storage 调用都通过 _safeGet / _safeSet 包一层 try/catch，
 *     非小程序环境（无 wx 全局）和读写失败都静默返回默认值。
 *   - SEARCH_HISTORY 截断到最近 MAX_HISTORY 条，避免长期使用爆 storage。
 *   - 数据形状：
 *       SEARCH_HISTORY = [{ query: string, at: number }]
 *       FAVORITES      = [{ id: string|number, at: number, snapshot: object|null }]
 */

const SEARCH_HISTORY_KEY = "lbr_search_history"
const FAVORITES_KEY = "lbr_favorites"
const MAX_HISTORY = 20

function _hasGet() {
  return typeof wx !== "undefined" && typeof wx.getStorageSync === "function"
}

function _hasSet() {
  return typeof wx !== "undefined" && typeof wx.setStorageSync === "function"
}

/**
 * 注意：原始实现用 `v || defaultVal`，这会把空数组当 truthy 正常返回（好）；
 * 但万一以后存 `0`/`""` 会被错误降级。这里仍保持 `||` 语义不动以维持向后兼容，
 * 但显式标注一下。
 */
function _safeGet(key, defaultVal) {
  try {
    if (!_hasGet()) return defaultVal
    const v = wx.getStorageSync(key)
    return v || defaultVal
  } catch (e) {
    return defaultVal
  }
}

function _safeSet(key, val) {
  try {
    if (!_hasSet()) return
    wx.setStorageSync(key, val)
  } catch (e) { /* silent */ }
}

/* ----------------------------- 搜索历史 ----------------------------- */

/** 记录一次搜索（去重 + 截断到 MAX_HISTORY） */
function recordSearchHistory(query) {
  if (!query || typeof query !== "string") return
  const q = query.trim()
  if (!q) return
  const history = _safeGet(SEARCH_HISTORY_KEY, [])
  // 反向写入：先剔除同 query，再 unshift，最后截断
  const filtered = []
  for (let i = 0; i < history.length; i++) {
    if (history[i] && history[i].query !== q) filtered.push(history[i])
  }
  filtered.unshift({ query: q, at: Date.now() })
  if (filtered.length > MAX_HISTORY) filtered.length = MAX_HISTORY
  _safeSet(SEARCH_HISTORY_KEY, filtered)
}

/** 返回搜索历史数组（最近在前） */
function getSearchHistory() {
  return _safeGet(SEARCH_HISTORY_KEY, [])
}

/** 清空搜索历史 */
function clearSearchHistory() {
  _safeSet(SEARCH_HISTORY_KEY, [])
}

/* ----------------------------- 收藏 ----------------------------- */

/** 找到 favorites 数组里 cardId 的下标；找不到返回 -1 */
function _findFavIndex(favs, cardId) {
  for (let i = 0; i < favs.length; i++) {
    if (favs[i] && favs[i].id === cardId) return i
  }
  return -1
}

/** 切换收藏状态（已收藏 → 取消；未收藏 → 收藏） */
function toggleFavorite(cardId, cardSnapshot) {
  if (!cardId) return false
  const favs = _safeGet(FAVORITES_KEY, [])
  const idx = _findFavIndex(favs, cardId)
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
  return _findFavIndex(favs, cardId) !== -1
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
