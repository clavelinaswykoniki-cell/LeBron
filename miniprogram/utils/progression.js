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
 */

/**
 * 段位定义，按 threshold 升序排列。
 */
const RANKS = [
  { id: 'bronze',  name: '青铜詹蜜',   threshold: 0   },
  { id: 'silver',  name: '白银詹蜜',   threshold: 10  },
  { id: 'gold',    name: '黄金詹蜜',   threshold: 30  },
  { id: 'diamond', name: '钻石詹蜜',   threshold: 80  },
  { id: 'king',    name: '王者詹皇',   threshold: 150 }
];

/**
 * 勋章定义。
 */
const BADGES = [
  { id: 'first_view',           name: '首战首胜', desc: '看了第一张卡' },
  { id: 'view_10',              name: '求知若渴', desc: '看了 10 张卡' },
  { id: 'view_50',              name: '辩论老兵', desc: '看了 50 张卡' },
  { id: 'view_all_categories',  name: '全面了解', desc: '至少各类 1 张' },
  { id: 'first_copy',           name: '复制第一句', desc: '首次复制' },
  { id: 'copy_50',              name: '弹药充足', desc: '复制 50 次' }
];

/**
 * wx.storage key。
 */
const STORAGE_KEY = 'lbr_progression';

/**
 * 全分类数量阈值：viewedCategories 数量大于等于这个值时认为"全面了解"。
 * 动态从 arsenal.cards 计算 distinct category 数量，避免硬编码 drift
 * （早期版本硬编码 30 但实际 cards 上有 38 个不同 category，导致 badge 早解锁）。
 */
const arsenal = require('../data/arsenal');
const ALL_CATEGORIES_COUNT = (function () {
  try {
    return new Set(arsenal.cards.map(function (c) { return c.category; })).size;
  } catch (e) {
    return 30;
  }
})();

/**
 * 返回一份默认 state 拷贝。
 * @returns {object}
 */
function _defaultState() {
  return {
    viewCount: 0,
    copyCount: 0,
    viewedCategories: [],
    unlockedBadgeIds: [],
    viewedCardIds: []
  };
}

/**
 * 从 wx.storage 读取 state；失败或缺字段则补全默认值。
 * @returns {object}
 */
function _load() {
  try {
    if (typeof wx === 'undefined' || !wx || typeof wx.getStorageSync !== 'function') {
      return _defaultState();
    }
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw || typeof raw !== 'object') {
      return _defaultState();
    }
    const def = _defaultState();
    return {
      viewCount:        typeof raw.viewCount === 'number' ? raw.viewCount : def.viewCount,
      copyCount:        typeof raw.copyCount === 'number' ? raw.copyCount : def.copyCount,
      viewedCategories: Array.isArray(raw.viewedCategories) ? raw.viewedCategories.slice() : def.viewedCategories,
      unlockedBadgeIds: Array.isArray(raw.unlockedBadgeIds) ? raw.unlockedBadgeIds.slice() : def.unlockedBadgeIds,
      viewedCardIds:    Array.isArray(raw.viewedCardIds)    ? raw.viewedCardIds.slice()    : def.viewedCardIds
    };
  } catch (e) {
    return _defaultState();
  }
}

/**
 * 持久化 state 到 wx.storage，失败静默。
 * @param {object} state
 */
function _save(state) {
  try {
    if (typeof wx === 'undefined' || !wx || typeof wx.setStorageSync !== 'function') {
      return;
    }
    wx.setStorageSync(STORAGE_KEY, state);
  } catch (e) {
    // silent
  }
}

/**
 * 根据 viewCount 返回当前段位（threshold <= viewCount 中 threshold 最大者）。
 * @param {number} viewCount
 * @returns {{id:string,name:string,threshold:number}}
 */
function _rankFor(viewCount) {
  let current = RANKS[0];
  for (let i = 0; i < RANKS.length; i++) {
    if (RANKS[i].threshold <= viewCount) {
      current = RANKS[i];
    } else {
      break;
    }
  }
  return current;
}

/**
 * 给定当前段位，返回下一档段位；已经在最高段位则返回当前段位本身。
 * @param {{id:string,name:string,threshold:number}} rank
 * @returns {{id:string,name:string,threshold:number}}
 */
function _nextRankAfter(rank) {
  const idx = RANKS.findIndex(function (r) { return r.id === rank.id; });
  if (idx < 0 || idx >= RANKS.length - 1) {
    return rank;
  }
  return RANKS[idx + 1];
}

/**
 * 把元素添加到数组（去重），原地修改并返回数组。
 * @param {Array} arr
 * @param {*} item
 * @returns {Array}
 */
function _addToSet(arr, item) {
  if (item === undefined || item === null) return arr;
  if (arr.indexOf(item) === -1) {
    arr.push(item);
  }
  return arr;
}

/**
 * 检查 state 当前进度，解锁尚未解锁的勋章。
 * 直接修改 state.unlockedBadgeIds，返回本次新解锁的 badgeIds 数组。
 * @param {object} state
 * @returns {string[]} newlyUnlockedIds
 */
function _checkBadges(state) {
  const newly = [];
  function unlock(id) {
    if (state.unlockedBadgeIds.indexOf(id) === -1) {
      state.unlockedBadgeIds.push(id);
      newly.push(id);
    }
  }
  if (state.viewCount >= 1)  unlock('first_view');
  if (state.viewCount >= 10) unlock('view_10');
  if (state.viewCount >= 50) unlock('view_50');
  if (Array.isArray(state.viewedCategories) && state.viewedCategories.length >= ALL_CATEGORIES_COUNT) {
    unlock('view_all_categories');
  }
  if (state.copyCount >= 1)  unlock('first_copy');
  if (state.copyCount >= 50) unlock('copy_50');
  return newly;
}

/**
 * 把 badgeIds 数组映射成 BADGES 中对应的完整对象数组。
 * @param {string[]} ids
 * @returns {Array<{id:string,name:string,desc:string}>}
 */
function _badgesByIds(ids) {
  if (!Array.isArray(ids)) return [];
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const def = BADGES.find(function (b) { return b.id === id; });
    if (def) {
      out.push({ id: def.id, name: def.name, desc: def.desc });
    }
  }
  return out;
}

/**
 * 记录一次卡片浏览。
 * - 同一 cardId 重复浏览不增加 viewCount。
 * - category 自动 addToSet 到 viewedCategories。
 * - 自动检查段位升级 + 勋章解锁。
 *
 * @param {string|number} cardId
 * @param {string} category
 * @returns {{rankUp:boolean, badgesUnlocked:Array<{id:string,name:string,desc:string}>}}
 */
function recordCardView(cardId, category) {
  const state = _load();
  const oldRank = _rankFor(state.viewCount);

  const idStr = (cardId === undefined || cardId === null) ? '' : String(cardId);
  const isNew = idStr !== '' && state.viewedCardIds.indexOf(idStr) === -1;

  if (isNew) {
    state.viewedCardIds.push(idStr);
    state.viewCount += 1;
  }
  if (typeof category === 'string' && category) {
    _addToSet(state.viewedCategories, category);
  }

  const newlyIds = _checkBadges(state);
  const newRank = _rankFor(state.viewCount);
  const rankUp = newRank.id !== oldRank.id;

  _save(state);

  return {
    rankUp: rankUp,
    badgesUnlocked: _badgesByIds(newlyIds)
  };
}

/**
 * 记录一次复制操作。
 * @returns {{badgesUnlocked:Array<{id:string,name:string,desc:string}>}}
 */
function recordCopy() {
  const state = _load();
  state.copyCount += 1;
  const newlyIds = _checkBadges(state);
  _save(state);
  return {
    badgesUnlocked: _badgesByIds(newlyIds)
  };
}

/**
 * 读取当前进度快照：段位、下一档段位、计数、分类、勋章（含解锁标志）。
 * @returns {{
 *   rank: {id:string,name:string,threshold:number},
 *   nextRank: {id:string,name:string,threshold:number},
 *   viewCount: number,
 *   copyCount: number,
 *   viewedCategories: string[],
 *   badges: Array<{id:string,name:string,desc:string,unlocked:boolean}>
 * }}
 */
function getCurrentRank() {
  const state = _load();
  const rank = _rankFor(state.viewCount);
  const nextRank = _nextRankAfter(rank);
  const badges = BADGES.map(function (b) {
    return {
      id: b.id,
      name: b.name,
      desc: b.desc,
      unlocked: state.unlockedBadgeIds.indexOf(b.id) !== -1
    };
  });
  return {
    rank: rank,
    nextRank: nextRank,
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
