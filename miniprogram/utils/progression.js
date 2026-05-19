/**
 * progression.js
 *
 * 段位 + 勋章系统：基于本地 wx.storage 持久化用户行为统计，
 * 暴露给页面层 recordCardView / recordCopy / getCurrentRank 三个 API。
 *
 * 状态形状 (state)：
 * {
 *   viewCount: number,         // 累计浏览卡片次数（去重后）
 *   copyCount: number,         // 累计复制次数
 *   viewedCategories: string[],// 已浏览过的分类列表（去重）
 *   unlockedBadgeIds: string[],// 已解锁勋章 id（去重）
 *   viewedCardIds: string[]    // 已浏览卡片 id（用于浏览防重）
 * }
 *
 * 性能注记（v2.5+）：
 *   - viewedCardIds 长度上限 = 全部 card 数（目前 215），用 array.indexOf 已经够用；
 *     若以后扩到 ≥ 1000 张，考虑 Set 化（这里仍按 array 序列化，保 storage 兼容）。
 *   - ALL_CATEGORIES_COUNT 在 module load 时一次性算好。
 *   - BADGES_BY_ID 用对象做 O(1) 查找替代每次 BADGES.find。
 */

const arsenal = require('../data/arsenal');

/** 段位定义，按 threshold 升序排列。 */
const RANKS = [
  { id: 'bronze',  name: '青铜詹蜜',   threshold: 0   },
  { id: 'silver',  name: '白银詹蜜',   threshold: 10  },
  { id: 'gold',    name: '黄金詹蜜',   threshold: 30  },
  { id: 'diamond', name: '钻石詹蜜',   threshold: 80  },
  { id: 'king',    name: '王者詹皇',   threshold: 150 }
];

/** 勋章定义。 */
const BADGES = [
  { id: 'first_view',           name: '首战首胜', desc: '看了第一张卡' },
  { id: 'view_10',              name: '求知若渴', desc: '看了 10 张卡' },
  { id: 'view_50',              name: '辩论老兵', desc: '看了 50 张卡' },
  { id: 'view_all_categories',  name: '全面了解', desc: '至少各类 1 张' },
  { id: 'first_copy',           name: '复制第一句', desc: '首次复制' },
  { id: 'copy_50',              name: '弹药充足', desc: '复制 50 次' }
];

const BADGES_BY_ID = (function () {
  const m = {};
  for (let i = 0; i < BADGES.length; i++) m[BADGES[i].id] = BADGES[i];
  return m;
})();

const STORAGE_KEY = 'lbr_progression';

/**
 * 全分类数量阈值：viewedCategories 数量大于等于这个值时认为"全面了解"。
 * 动态从 arsenal.cards 计算 distinct category 数量，避免硬编码 drift。
 */
const ALL_CATEGORIES_COUNT = (function () {
  try {
    const seen = new Set();
    const cards = arsenal.cards || [];
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (c && c.category) seen.add(c.category);
    }
    return seen.size || 30;
  } catch (e) {
    return 30;
  }
})();

/* ----------------------------- 存储工具 ----------------------------- */

function _hasStorage() {
  return typeof wx !== 'undefined' && wx
    && typeof wx.getStorageSync === 'function'
    && typeof wx.setStorageSync === 'function';
}

function _defaultState() {
  return {
    viewCount: 0,
    copyCount: 0,
    viewedCategories: [],
    unlockedBadgeIds: [],
    viewedCardIds: []
  };
}

function _load() {
  try {
    if (!_hasStorage()) return _defaultState();
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw || typeof raw !== 'object') return _defaultState();
    return {
      viewCount:        typeof raw.viewCount === 'number' ? raw.viewCount : 0,
      copyCount:        typeof raw.copyCount === 'number' ? raw.copyCount : 0,
      viewedCategories: Array.isArray(raw.viewedCategories) ? raw.viewedCategories.slice() : [],
      unlockedBadgeIds: Array.isArray(raw.unlockedBadgeIds) ? raw.unlockedBadgeIds.slice() : [],
      viewedCardIds:    Array.isArray(raw.viewedCardIds)    ? raw.viewedCardIds.slice()    : []
    };
  } catch (e) {
    return _defaultState();
  }
}

function _save(state) {
  try {
    if (!_hasStorage()) return;
    wx.setStorageSync(STORAGE_KEY, state);
  } catch (e) { /* silent */ }
}

/* ----------------------------- 段位 ----------------------------- */

/** RANKS 升序，找到 threshold ≤ viewCount 中最大的那个 */
function _rankFor(viewCount) {
  let current = RANKS[0];
  for (let i = 0; i < RANKS.length; i++) {
    if (RANKS[i].threshold <= viewCount) current = RANKS[i];
    else break;
  }
  return current;
}

function _nextRankAfter(rank) {
  for (let i = 0; i < RANKS.length; i++) {
    if (RANKS[i].id === rank.id) {
      return RANKS[i + 1] || rank;
    }
  }
  return rank;
}

/* ----------------------------- 勋章 ----------------------------- */

/**
 * 检查 state 当前进度，解锁尚未解锁的勋章（原地修改 unlockedBadgeIds）。
 * 返回本次新解锁的 badgeIds。
 */
function _checkBadges(state) {
  const newly = [];
  const owned = new Set(state.unlockedBadgeIds);
  function unlock(id) {
    if (!owned.has(id)) {
      state.unlockedBadgeIds.push(id);
      owned.add(id);
      newly.push(id);
    }
  }
  if (state.viewCount >= 1)  unlock('first_view');
  if (state.viewCount >= 10) unlock('view_10');
  if (state.viewCount >= 50) unlock('view_50');
  if (Array.isArray(state.viewedCategories)
      && state.viewedCategories.length >= ALL_CATEGORIES_COUNT) {
    unlock('view_all_categories');
  }
  if (state.copyCount >= 1)  unlock('first_copy');
  if (state.copyCount >= 50) unlock('copy_50');
  return newly;
}

function _badgesByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    const def = BADGES_BY_ID[ids[i]];
    if (def) out.push({ id: def.id, name: def.name, desc: def.desc });
  }
  return out;
}

/* ----------------------------- 主 API ----------------------------- */

/**
 * 记录一次卡片浏览。
 * - 同一 cardId 重复浏览不增加 viewCount。
 * - category 自动 dedup 到 viewedCategories。
 * - 自动检查段位升级 + 勋章解锁。
 */
function recordCardView(cardId, category) {
  const state = _load();
  const oldRank = _rankFor(state.viewCount);

  const idStr = (cardId === undefined || cardId === null) ? '' : String(cardId);
  if (idStr !== '' && state.viewedCardIds.indexOf(idStr) === -1) {
    state.viewedCardIds.push(idStr);
    state.viewCount += 1;
  }
  if (typeof category === 'string' && category
      && state.viewedCategories.indexOf(category) === -1) {
    state.viewedCategories.push(category);
  }

  const newlyIds = _checkBadges(state);
  const newRank = _rankFor(state.viewCount);
  _save(state);

  return {
    rankUp: newRank.id !== oldRank.id,
    badgesUnlocked: _badgesByIds(newlyIds)
  };
}

function recordCopy() {
  const state = _load();
  state.copyCount += 1;
  const newlyIds = _checkBadges(state);
  _save(state);
  return { badgesUnlocked: _badgesByIds(newlyIds) };
}

function getCurrentRank() {
  const state = _load();
  const rank = _rankFor(state.viewCount);
  const unlocked = new Set(state.unlockedBadgeIds);
  const badges = new Array(BADGES.length);
  for (let i = 0; i < BADGES.length; i++) {
    const b = BADGES[i];
    badges[i] = { id: b.id, name: b.name, desc: b.desc, unlocked: unlocked.has(b.id) };
  }
  return {
    rank: rank,
    nextRank: _nextRankAfter(rank),
    viewCount: state.viewCount,
    copyCount: state.copyCount,
    viewedCategories: state.viewedCategories.slice(),
    badges: badges
  };
}

module.exports = {
  RANKS: RANKS,
  BADGES: BADGES,
  STORAGE_KEY: STORAGE_KEY,
  recordCardView: recordCardView,
  recordCopy: recordCopy,
  getCurrentRank: getCurrentRank
};
