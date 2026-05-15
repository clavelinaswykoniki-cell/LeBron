/**
 * duel.js — 段位对抗核心（PK 答题 + 排行榜 + 战绩记录）
 *
 * v2.4 全部用本地 mock 数据 + localStorage。后端备案完成后，把每个
 * 暴露函数（getLeaderboard / getMyRank / startMatch / submitMatch）的
 * 内部替换为 wx.request 调 ECS API 即可。调用方契约不变。
 *
 * 数据契约（前端 / 后端通用）：
 *   getLeaderboard()      → Array<{rank, name, avatar, viewCount, copyCount, score}>
 *   getMyRank()           → {rank, total, score, nickname}
 *   startMatch()          → {matchId, questions: [{cardId, prompt, options, correctIndex}]}
 *   submitMatch(id, ans)  → {score, rankChange, history}
 *   getDuelHistory()      → Array<{matchId, score, date, correct, total}>
 */

const arsenal = require("../data/arsenal")

// 顶部一次性 require progression，避免重复 require + 错误吞噬
let progression = null
try { progression = require("./progression") } catch (e) {}

const HISTORY_KEY = "lbr_duel_history"
const MOCK_LEADERBOARD_KEY = "lbr_mock_leaderboard"

const RANK_TIERS = [
  { id: "bronze",  name: "青铜詹蜜",   threshold: 0   },
  { id: "silver",  name: "白银詹蜜",   threshold: 200 },
  { id: "gold",    name: "黄金詹蜜",   threshold: 500 },
  { id: "diamond", name: "钻石詹蜜",   threshold: 1000 },
  { id: "king",    name: "王者詹皇",   threshold: 1800 }
]

// mock 玩家名 + 头像 emoji（100 个）
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

function _rankFor(score) {
  const safe = Math.max(0, typeof score === "number" && !isNaN(score) ? score : 0)
  let tier = RANK_TIERS[0]
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].threshold <= safe) tier = RANK_TIERS[i]
  }
  return tier
}

function _seedRandom(seed) {
  // 简单 LCG 伪随机，让 mock 玩家每次刷新顺序不抖动
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function _getOrCreateMockLeaderboard() {
  let cached = []
  if (typeof wx !== "undefined" && wx.getStorageSync) {
    try { cached = wx.getStorageSync(MOCK_LEADERBOARD_KEY) || [] } catch (e) {}
  }
  if (Array.isArray(cached) && cached.length === 100) return cached

  const rand = _seedRandom(20260515)
  const players = MOCK_NAMES.slice(0, 100).map((name, i) => {
    const score = Math.floor(1800 - i * 16 - rand() * 30)
    const viewCount = Math.floor(score * 0.3 + rand() * 50)
    const copyCount = Math.floor(score * 0.15 + rand() * 30)
    return {
      rank: i + 1,
      name,
      avatar: MOCK_AVATARS[i % MOCK_AVATARS.length],
      viewCount,
      copyCount,
      score,
      isMe: false
    }
  })

  if (typeof wx !== "undefined" && wx.setStorageSync) {
    try { wx.setStorageSync(MOCK_LEADERBOARD_KEY, players) } catch (e) {}
  }
  return players
}

function _getMyScore() {
  if (!progression || typeof progression.getCurrentRank !== "function") return 0
  const snap = progression.getCurrentRank()
  // 综合分：view × 10 + copy × 5 + 战绩历史最高 × 3
  const history = getDuelHistory()
  const validScores = history
    .map((h) => h && h.score)
    .filter((s) => typeof s === "number" && !isNaN(s))
  const bestPk = validScores.length ? Math.max.apply(null, validScores) : 0
  return (snap.viewCount || 0) * 10 + (snap.copyCount || 0) * 5 + bestPk * 3
}

function _getMyNickname() {
  if (typeof wx === "undefined" || !wx.getStorageSync) return "我"
  try {
    const profile = wx.getStorageSync("lbr_user_profile") || {}
    return profile.nickname || "我"
  } catch (e) { return "我" }
}

function getLeaderboard() {
  const players = _getOrCreateMockLeaderboard().slice()
  const myScore = _getMyScore()
  const myNickname = _getMyNickname()

  // 插入"我"
  let myEntry = {
    rank: 0,
    name: myNickname,
    avatar: "🎯",
    viewCount: 0,
    copyCount: 0,
    score: myScore,
    isMe: true
  }
  if (progression && typeof progression.getCurrentRank === "function") {
    try {
      const snap = progression.getCurrentRank()
      myEntry.viewCount = snap.viewCount || 0
      myEntry.copyCount = snap.copyCount || 0
    } catch (e) {}
  }

  const all = players.concat([myEntry]).sort((a, b) => b.score - a.score)
  all.forEach((p, i) => { p.rank = i + 1 })
  return all
}

function getMyRank() {
  const all = getLeaderboard()
  const me = all.find((p) => p.isMe) || { rank: 0, score: 0 }
  return {
    rank: me.rank,
    total: all.length,
    score: me.score,
    nickname: me.name,
    tier: _rankFor(me.score)
  }
}

function _pickRandomCards(n) {
  const cards = (arsenal.cards || []).filter((c) =>
    c && c.claim && c.short_reply && c.id
  )
  const out = []
  const used = {}
  const max = Math.min(n, cards.length)
  while (out.length < max) {
    const idx = Math.floor(Math.random() * cards.length)
    if (used[idx]) continue
    used[idx] = true
    out.push(cards[idx])
  }
  return out
}

function _generateDistractors(card, allCards) {
  // 抽 3 张其他卡的 short_reply 作为干扰项。最多尝试 50 次避免死循环。
  const out = []
  const used = { [card.id]: true }
  let attempts = 0
  while (out.length < 3 && attempts < 50) {
    attempts += 1
    const idx = Math.floor(Math.random() * allCards.length)
    const c = allCards[idx]
    if (!c || used[c.id] || !c.short_reply) continue
    used[c.id] = true
    out.push(c.short_reply)
  }
  // 凑不够 3 个就用占位符（极端情况下 allCards 不足）
  while (out.length < 3) out.push("（暂无可选项）")
  return out
}

function startMatch() {
  const picks = _pickRandomCards(5)
  const allCards = arsenal.cards || []
  const questions = picks.map((card) => {
    const distractors = _generateDistractors(card, allCards)
    const options = distractors.concat([card.short_reply])
    // shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
    const correctIndex = options.indexOf(card.short_reply)
    return {
      cardId: card.id,
      prompt: card.claim,
      category: card.category,
      options,
      correctIndex
    }
  })
  return {
    matchId: "match_" + Date.now(),
    questions,
    startedAt: Date.now()
  }
}

function submitMatch(matchId, answers, questions) {
  // answers: array of selected indices, questions: array from startMatch
  let correct = 0
  ;(answers || []).forEach((a, i) => {
    if (questions[i] && a === questions[i].correctIndex) correct += 1
  })
  const total = questions.length
  const score = correct * 20 // 每题 20 分，满分 100

  // 段位变化：基于得分给出 +/- 段位分
  let rankChange = 0
  if (score >= 80) rankChange = +30
  else if (score >= 60) rankChange = +10
  else if (score >= 40) rankChange = 0
  else rankChange = -10

  const record = {
    matchId,
    score,
    correct,
    total,
    date: Date.now(),
    rankChange
  }

  // 存历史
  if (typeof wx !== "undefined" && wx.setStorageSync) {
    try {
      const history = getDuelHistory()
      history.unshift(record)
      const trimmed = history.slice(0, 50)
      wx.setStorageSync(HISTORY_KEY, trimmed)
    } catch (e) {}
  }

  return { score, correct, total, rankChange, record }
}

function getDuelHistory() {
  if (typeof wx === "undefined" || !wx.getStorageSync) return []
  try {
    const raw = wx.getStorageSync(HISTORY_KEY)
    if (!Array.isArray(raw)) return []
    return raw
  } catch (e) { return [] }
}

function clearDuelHistory() {
  if (typeof wx === "undefined" || !wx.setStorageSync) return
  try { wx.setStorageSync(HISTORY_KEY, []) } catch (e) {}
}

function getStats() {
  const history = getDuelHistory()
  const validScores = history
    .map((h) => h && h.score)
    .filter((s) => typeof s === "number" && !isNaN(s))
  if (!validScores.length) return { total: history.length, best: 0, avg: 0, wins: 0 }
  return {
    total: history.length,
    best: Math.max.apply(null, validScores),
    avg: Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length),
    wins: validScores.filter((s) => s >= 60).length
  }
}

module.exports = {
  RANK_TIERS,
  getLeaderboard,
  getMyRank,
  startMatch,
  submitMatch,
  getDuelHistory,
  clearDuelHistory,
  getStats
}
