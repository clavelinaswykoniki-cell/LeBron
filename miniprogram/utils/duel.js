/**
 * duel.js — 段位对抗核心（PK 答题 + 排行榜 + 战绩记录）
 *
 * v2.5: getLeaderboard 保留为同步版（本地 mock + 我），用于无网兜底；
 *       新增 fetchLeaderboard (async) 优先调 GET /api/leaderboard，失败降级到本地。
 *       submitMatch 写完本地 history 后 fire-and-forget POST /api/pk/submit，
 *       后端失败不影响用户感知。
 *
 * 数据契约（前端 / 后端通用）：
 *   getLeaderboard()      → Array<{rank, name, avatar, viewCount, copyCount, score, isMe}>
 *   fetchLeaderboard()    → Promise<{fromServer:boolean, players: Array<...>}>
 *   getMyRank()           → {rank, total, score, nickname, tier}
 *   startMatch()          → {matchId, questions: [{cardId, prompt, options, correctIndex}]}
 *   submitMatch(id, ans, qs) → {score, rankChange, history}
 *   getDuelHistory()      → Array<{matchId, score, date, correct, total}>
 */

const arsenal = require("../data/arsenal")
const api = require("./api")
const userProfile = require("./userProfile")

let progression = null
try { progression = require("./progression") } catch (e) {}

const HISTORY_KEY = "lbr_duel_history"
const MOCK_LEADERBOARD_KEY = "lbr_mock_leaderboard"
const MOCK_LEADERBOARD_SIZE = 100
const MOCK_SEED = 20260515

const RANK_TIERS = [
  { id: "bronze",  name: "青铜詹蜜",   threshold: 0   },
  { id: "silver",  name: "白银詹蜜",   threshold: 200 },
  { id: "gold",    name: "黄金詹蜜",   threshold: 500 },
  { id: "diamond", name: "钻石詹蜜",   threshold: 1000 },
  { id: "king",    name: "王者詹皇",   threshold: 1800 }
]

const MOCK_NAMES = [
  "湖人骨灰粉","23号信徒","King James","紫金王朝","Strive4Greatness","南海岸老人",
  "热火不死鸟","骑士复仇者","Decision1","NotOneNotTwo","跨步追防者","历史第一人",
  "全能锋线","Chosen1","BronSeason","FMVP收藏家","三冠工程师","41岁仍在场",
  "球场指挥官","传奇延续","抱团终结者","错位之王","Block of His Life","老詹永远的神",
  "破纪录机器","得分王","总决赛三双","王朝建筑师","8 分释兵权辩护士","Excel球王辟谣官",
  "米奇冠军反驳师","泡泡冠军捍卫者","21后还能打","Cleveland Choose Me","23号永不退役",
  "Lake Show 1","Lake Show 2","Lake Show 3","Heat Culture","Witness Era","Cavs2.0老粉",
  "湖人队史第二","历史得分王粉","40000+ Club","唯一三队FMVP","总冠军搬运工","老张支持者",
  "詹密铁三角","紫金不灭","传奇还在写","NBA上限论者","King's Court","Throne保卫者",
  "21年球场神","数据控老詹粉","Excel不黑","摊皇是误解","Stay True 23","Cleveland Heart",
  "Akron Hammer","Spectacle King","Modern GOAT","Floor General","北京湖人粉","上海湖蜜",
  "广东23号","成都King","深圳紫金","杭州詹蜜","Tokyo Lake","SoCal LBJ","NY Knicks变节",
  "篮球教科书","Court Vision","Pass Master","Highlight Tape","Comeback King","跨人禁赛吃瓜",
  "JR救命","Ray Allen原谅","Kyrie G7信徒","欧文绝杀粉","Wade兄弟情","Bosh三巨头",
  "AD合伙人","Westbrook错配","Russell忠诚粉","Penny老粉","Magic迷","Bird对比强迫症",
  "Wilt vs LBJ","Jordan也尊敬","Kobe尊重","邓肯敬意","奥拉朱旺脚步迷","数据派","战术派",
  "时代派","对比派","心理派"
]

const MOCK_AVATARS = ["🦁","👑","🏆","🐐","💍","⛹️","🏀","🌟","💫","✨","🔥","⚡"]

// --- 私有缓存 ---
// _mockLeaderboardCache: 进程内缓存，避免每次 getLeaderboard 都过 wx.storage
// 失败时（无 wx 或 wx.getStorageSync 抛错）退化为按种子重新生成
let _mockLeaderboardCache = null

// --- PK 题库缓存：filter 一次，多次复用 ---
let _pkCardPoolCache = null
function _getPkCardPool() {
  if (_pkCardPoolCache) return _pkCardPoolCache
  const allCards = arsenal.cards || []
  const pool = []
  for (let i = 0; i < allCards.length; i++) {
    const c = allCards[i]
    if (c && c.claim && c.short_reply && c.id) pool.push(c)
  }
  _pkCardPoolCache = pool
  return pool
}

/* ------------------------------------------------------------------ *
 * 段位 & 工具
 * ------------------------------------------------------------------ */

function _rankFor(score) {
  const safe = Math.max(0, typeof score === "number" && !isNaN(score) ? score : 0)
  let tier = RANK_TIERS[0]
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].threshold <= safe) tier = RANK_TIERS[i]
    else break // RANK_TIERS 是升序，越过即可
  }
  return tier
}

function _seedRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/** 从历史里提取所有合法 score，给 _getMyScore / getStats 共用 */
function _validScores(history) {
  const out = []
  for (let i = 0; i < history.length; i++) {
    const s = history[i] && history[i].score
    if (typeof s === "number" && !isNaN(s)) out.push(s)
  }
  return out
}

/* ------------------------------------------------------------------ *
 * 排行榜
 * ------------------------------------------------------------------ */

function _buildMockLeaderboard() {
  const rand = _seedRandom(MOCK_SEED)
  const n = Math.min(MOCK_NAMES.length, MOCK_LEADERBOARD_SIZE)
  const players = new Array(n)
  for (let i = 0; i < n; i++) {
    const score = Math.floor(1800 - i * 16 - rand() * 30)
    const viewCount = Math.floor(score * 0.3 + rand() * 50)
    const copyCount = Math.floor(score * 0.15 + rand() * 30)
    players[i] = {
      rank: i + 1,
      name: MOCK_NAMES[i],
      avatar: MOCK_AVATARS[i % MOCK_AVATARS.length],
      viewCount: viewCount,
      copyCount: copyCount,
      score: score,
      isMe: false
    }
  }
  return players
}

function _getOrCreateMockLeaderboard() {
  if (_mockLeaderboardCache) return _mockLeaderboardCache

  let cached = null
  if (typeof wx !== "undefined" && wx.getStorageSync) {
    try {
      const raw = wx.getStorageSync(MOCK_LEADERBOARD_KEY)
      if (Array.isArray(raw) && raw.length === MOCK_LEADERBOARD_SIZE) cached = raw
    } catch (e) { /* silent */ }
  }
  if (!cached) {
    cached = _buildMockLeaderboard()
    if (typeof wx !== "undefined" && wx.setStorageSync) {
      try { wx.setStorageSync(MOCK_LEADERBOARD_KEY, cached) } catch (e) {}
    }
  }
  _mockLeaderboardCache = cached
  return cached
}

function _getMyScore() {
  if (!progression || typeof progression.getCurrentRank !== "function") return 0
  const snap = progression.getCurrentRank()
  const scores = _validScores(getDuelHistory())
  const bestPk = scores.length ? Math.max.apply(null, scores) : 0
  return (snap.viewCount || 0) * 10 + (snap.copyCount || 0) * 5 + bestPk * 3
}

function _getMyNickname() {
  const profile = userProfile.getProfile()
  if (profile.nickname) return profile.nickname
  if (typeof wx === "undefined" || !wx.getStorageSync) return "我"
  try {
    const old = wx.getStorageSync("lbr_user_profile") || {}
    return old.nickname || "我"
  } catch (e) { return "我" }
}

function _avatarForOpenid(openid) {
  if (!openid) return MOCK_AVATARS[0]
  let h = 0
  for (let i = 0; i < openid.length; i++) {
    h = (h * 31 + openid.charCodeAt(i)) & 0x7fffffff
  }
  return MOCK_AVATARS[h % MOCK_AVATARS.length]
}

function _buildMyEntry() {
  const profile = userProfile.getProfile()
  const entry = {
    rank: 0,
    name: profile.nickname || _getMyNickname(),
    avatar: profile.avatar_url || "🎯",
    viewCount: 0,
    copyCount: 0,
    score: _getMyScore(),
    isMe: true
  }
  if (progression && typeof progression.getCurrentRank === "function") {
    try {
      const snap = progression.getCurrentRank()
      entry.viewCount = snap.viewCount || 0
      entry.copyCount = snap.copyCount || 0
    } catch (e) {}
  }
  return entry
}

/** 通用排序 + 重排 rank（players 原地） */
function _resortAndReRank(players) {
  players.sort(function (a, b) { return b.score - a.score })
  for (let i = 0; i < players.length; i++) players[i].rank = i + 1
}

/**
 * 同步版本：本地 mock 100 玩家 + 我，按 score 排序。无网兜底。
 */
function getLeaderboard() {
  const mock = _getOrCreateMockLeaderboard()
  const all = new Array(mock.length + 1)
  for (let i = 0; i < mock.length; i++) all[i] = mock[i]
  all[mock.length] = _buildMyEntry()
  _resortAndReRank(all)
  return all
}

/**
 * 异步版本：优先 GET /api/leaderboard，失败降级到 getLeaderboard()。
 * 返回 { fromServer: boolean, players: Array }
 */
function fetchLeaderboard(opts) {
  const limit = (opts && opts.limit) || 50
  const myOpenid = userProfile.getOrCreateOpenId()

  return api.requestWithFallback(
    "GET", "/api/leaderboard", { limit: limit },
    function () { return null }
  ).then(function (resp) {
    if (!resp || !Array.isArray(resp.data)) {
      return { fromServer: false, players: getLeaderboard() }
    }
    const players = resp.data.map(function (row, i) {
      return {
        rank: row.rank || (i + 1),
        name: row.nickname || "匿名玩家",
        avatar: row.avatar_url || _avatarForOpenid(row.openid),
        viewCount: 0,
        copyCount: 0,
        score: row.score,
        tier: row.tier,
        isMe: row.openid === myOpenid
      }
    })
    let hasMe = false
    for (let i = 0; i < players.length; i++) {
      if (players[i].isMe) { hasMe = true; break }
    }
    if (!hasMe) {
      players.push(_buildMyEntry())
      _resortAndReRank(players)
    }
    return { fromServer: true, players: players }
  })
}

function getMyRank() {
  const all = getLeaderboard()
  let me = null
  for (let i = 0; i < all.length; i++) {
    if (all[i].isMe) { me = all[i]; break }
  }
  if (!me) me = { rank: 0, score: 0, name: "我" }
  return {
    rank: me.rank,
    total: all.length,
    score: me.score,
    nickname: me.name,
    tier: _rankFor(me.score)
  }
}

/* ------------------------------------------------------------------ *
 * PK 题库 + 对战
 * ------------------------------------------------------------------ */

/** Fisher-Yates 截取前 n 张（不修改原数组） */
function _pickRandomCards(n) {
  const pool = _getPkCardPool()
  const max = Math.min(n, pool.length)
  if (max <= 0) return []
  // 复制索引数组做局部 shuffle，比早期 while-retry-with-used-map 更稳定（不会陷死循环）
  const idxs = new Array(pool.length)
  for (let i = 0; i < pool.length; i++) idxs[i] = i
  for (let i = 0; i < max; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i))
    const tmp = idxs[i]; idxs[i] = idxs[j]; idxs[j] = tmp
  }
  const out = new Array(max)
  for (let i = 0; i < max; i++) out[i] = pool[idxs[i]]
  return out
}

/** 从题库里随机选 3 个不同 card 的 short_reply 当干扰项 */
function _generateDistractors(card) {
  const pool = _getPkCardPool()
  const out = []
  const used = new Set()
  used.add(card.id)

  if (pool.length <= 1) {
    while (out.length < 3) out.push("（暂无可选项）")
    return out
  }

  // 用洗牌但只取需要的前 3 个，比 while(Math.random) 重试稳定
  // 数组复制成本：215 张 * O(1)，常数极小
  const idxs = new Array(pool.length)
  for (let i = 0; i < pool.length; i++) idxs[i] = i
  let collected = 0
  let i = 0
  // 局部 Fisher-Yates，每次只洗到拿够 3 个为止
  while (collected < 3 && i < pool.length) {
    const j = i + Math.floor(Math.random() * (pool.length - i))
    const tmp = idxs[i]; idxs[i] = idxs[j]; idxs[j] = tmp
    const candidate = pool[idxs[i]]
    if (candidate && !used.has(candidate.id) && candidate.short_reply) {
      used.add(candidate.id)
      out.push(candidate.short_reply)
      collected += 1
    }
    i += 1
  }
  while (out.length < 3) out.push("（暂无可选项）")
  return out
}

function startMatch() {
  const picks = _pickRandomCards(5)
  const questions = picks.map(function (card) {
    const distractors = _generateDistractors(card)
    const options = distractors.concat([card.short_reply])
    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = options[i]; options[i] = options[j]; options[j] = tmp
    }
    return {
      cardId: card.id,
      prompt: card.claim,
      category: card.category,
      options: options,
      correctIndex: options.indexOf(card.short_reply)
    }
  })
  return {
    matchId: "match_" + Date.now(),
    questions: questions,
    startedAt: Date.now()
  }
}

function submitMatch(matchId, answers, questions) {
  let correct = 0
  const ans = answers || []
  for (let i = 0; i < ans.length; i++) {
    if (questions[i] && ans[i] === questions[i].correctIndex) correct += 1
  }
  const total = questions.length
  const score = correct * 20

  let rankChange = 0
  if (score >= 80) rankChange = 30
  else if (score >= 60) rankChange = 10
  else if (score >= 40) rankChange = 0
  else rankChange = -10

  const record = { matchId, score, correct, total, date: Date.now(), rankChange }

  // 写本地战绩
  if (typeof wx !== "undefined" && wx.setStorageSync) {
    try {
      const history = getDuelHistory()
      history.unshift(record)
      wx.setStorageSync(HISTORY_KEY, history.slice(0, 50))
    } catch (e) {
      // 写失败不抛，下次重试
    }
  }

  // fire-and-forget 同步到后端；失败只 console.warn，不影响本地体验
  try {
    const profile = userProfile.getProfile()
    api.post("/api/pk/submit", {
      openid: profile.openid,
      nickname: profile.nickname || undefined,
      avatar_url: profile.avatar_url || undefined,
      score: score,
      total: total,
      delta: rankChange
    }).catch(function (err) {
      console.warn("[duel] pk/submit 后端同步失败（本地数据已保存）:", err && err.message)
    })
  } catch (e) {
    // silent — 后端同步不应影响 PK 主流程
  }

  return { score, correct, total, rankChange, record }
}

/* ------------------------------------------------------------------ *
 * 历史 & 统计
 * ------------------------------------------------------------------ */

function getDuelHistory() {
  if (typeof wx === "undefined" || !wx.getStorageSync) return []
  try {
    const raw = wx.getStorageSync(HISTORY_KEY)
    return Array.isArray(raw) ? raw : []
  } catch (e) { return [] }
}

function clearDuelHistory() {
  if (typeof wx === "undefined" || !wx.setStorageSync) return
  try { wx.setStorageSync(HISTORY_KEY, []) } catch (e) {}
}

function getStats() {
  const history = getDuelHistory()
  const scores = _validScores(history)
  if (!scores.length) return { total: history.length, best: 0, avg: 0, wins: 0 }
  let sum = 0
  let best = scores[0]
  let wins = 0
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i]
    sum += s
    if (s > best) best = s
    if (s >= 60) wins += 1
  }
  return {
    total: history.length,
    best: best,
    avg: Math.round(sum / scores.length),
    wins: wins
  }
}

module.exports = {
  RANK_TIERS,
  getLeaderboard,
  fetchLeaderboard,
  getMyRank,
  startMatch,
  submitMatch,
  getDuelHistory,
  clearDuelHistory,
  getStats
}
