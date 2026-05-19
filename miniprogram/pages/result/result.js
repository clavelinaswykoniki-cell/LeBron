const { matchQuery, randomCard } = require("../../utils/matchQuery")
const { generateEnhancedReply, generateWithLocalCard } = require("../../utils/llmProvider")
const { tactileFeedback } = require("../../utils/feedback")
const progression = require("../../utils/progression")
const safety = require("../../utils/safety")
const storage = require("../../utils/storage")
const cardShare = require("../../utils/cardShare")
const arsenal = require("../../data/arsenal")
const corePositions = require("../../data/core_positions")

const extendedById = arsenal.extendedById || {}
const allCards = arsenal.cards || []

/* ---------- 局部工具：与 index.js 行为对齐 ---------- */

function wrapCard(card, alias) {
  return {
    resultKey: card.id,
    alias,
    category: card.category,
    priority: 1,
    card
  }
}

function normalizeResults(results) {
  return results.map((item, index) => {
    const cardId = item.card && item.card.id
    const extended = cardId ? extendedById[cardId] : null
    return {
      resultKey: item.resultKey || cardId || `${item.category || "result"}_${index}`,
      isFavorited: cardId ? storage.isFavorited(cardId) : false,
      isEnhancing: false,
      expanded: false,
      hasExtended: !!extended,
      extendedDetail: extended || null,
      ...item
    }
  })
}

function buildCardText(item) {
  if (!item || !item.card) return ""
  const card = item.card
  return [
    `【${card.category}】`,
    card.claim,
    "",
    "简短版：",
    card.short_reply,
    "",
    "逻辑版：",
    card.long_reply,
    "",
    "一句话反击：",
    card.one_liner,
    "",
    "视频口播版：",
    card.video_script
  ].join("\n")
}

function copyToClipboard(text, title) {
  if (!text) {
    wx.showToast({ title: "没有可复制内容", icon: "none" })
    return
  }
  wx.setClipboardData({
    data: text,
    success: () => {
      tactileFeedback({ toast: title })
      try {
        const { badgesUnlocked } = progression.recordCopy()
        if (badgesUnlocked && badgesUnlocked.length) {
          setTimeout(() => {
            wx.showToast({ title: "🏆 解锁勋章：" + badgesUnlocked[0].name, icon: "none", duration: 1800 })
          }, 1200)
        }
      } catch (e) {}
    },
    fail: () => wx.showToast({ title: "复制失败，请重试", icon: "none" })
  })
}

function trackCardViews(results) {
  if (!results || !results.length) return
  let firstRankUp = null
  let firstBadge = null
  results.forEach((item) => {
    if (!item || !item.card) return
    try {
      const { rankUp, badgesUnlocked } = progression.recordCardView(item.card.id, item.card.category)
      if (rankUp && !firstRankUp) firstRankUp = progression.getCurrentRank()
      if (!firstBadge && badgesUnlocked && badgesUnlocked.length) firstBadge = badgesUnlocked[0]
    } catch (e) {}
  })
  if (firstRankUp) {
    setTimeout(() => {
      wx.showToast({ title: "✨ 升段：" + firstRankUp.rank.name, icon: "none", duration: 2000 })
    }, 800)
  } else if (firstBadge) {
    setTimeout(() => {
      wx.showToast({ title: "🏆 解锁勋章：" + firstBadge.name, icon: "none", duration: 1800 })
    }, 800)
  }
}

function tapFeedback() {
  if (typeof wx !== "undefined" && wx.vibrateShort) {
    wx.vibrateShort({ type: "light" })
  }
}

/* ---------- Page ---------- */

Page({
  data: {
    query: "",
    /** 用 query 派生的 banner 文案，避免 wxml 里做字符串拼接 */
    titleText: "",
    hitCount: 0,
    results: [],
    activeMood: "short_reply",
    activeMoodLabel: "短刀",
    moodTabs: [
      { id: "short_reply", name: "短刀", field: "short_reply" },
      { id: "one_liner", name: "封口", field: "one_liner" },
      { id: "long_reply", name: "长拆", field: "long_reply" },
      { id: "video_script", name: "口播", field: "video_script" }
    ],
    isRandom: false,
    shareCanvasVisible: false
  },

  onLoad(options) {
    options = options || {}

    let q = ""
    if (options.query) {
      try { q = decodeURIComponent(options.query) } catch (e) { q = options.query }
    }
    q = (q || "").trim()

    const isRandom = options.random === "1" || options.random === 1
    let focusId = ""
    if (options.focus) {
      try { focusId = decodeURIComponent(options.focus) } catch (e) { focusId = options.focus }
    }

    let results = []
    if (focusId) {
      // 从收藏 / 历史等深链跳过来：精确定位某张卡
      const focusCard = allCards.find((c) => c.id === focusId)
      if (focusCard) {
        if (!q) q = (focusCard.tags && focusCard.tags[0]) || focusCard.category
        results = [wrapCard(focusCard, "深链定位")]
      } else {
        // focus 失效就降级成 q（或随机）
        if (!q) q = "未找到卡片"
        results = matchQuery(q)
      }
    } else if (isRandom) {
      const card = randomCard()
      const alias = (card && card.tags && card.tags[0]) || (card && card.category) || "随机"
      if (!q) q = alias
      results = [wrapCard(card, "随机")]
    } else if (!q) {
      // 没传 query 也没标记 random：兜底走"随机一张"，避免空页面
      const card = randomCard()
      q = (card && card.tags && card.tags[0]) || (card && card.category) || "随机一张"
      results = [wrapCard(card, "兜底随机")]
    } else {
      results = matchQuery(q)
    }

    const normalized = normalizeResults(results)
    const titleText = `拆解：${q}`

    this.setData({
      query: q,
      titleText,
      isRandom,
      hitCount: normalized.length,
      results: normalized,
      activeMood: "short_reply",
      activeMoodLabel: "短刀"
    })

    if (typeof wx !== "undefined" && wx.setNavigationBarTitle) {
      // 标题太长会被微信截断，这里保守保留 16 字
      const navTitle = titleText.length > 16 ? titleText.slice(0, 15) + "…" : titleText
      wx.setNavigationBarTitle({ title: navTitle })
    }

    try { storage.recordSearchHistory(q) } catch (e) {}
    trackCardViews(normalized)
  },

  /* ---------- 通用更新 helper ---------- */

  updateResultLists(updater) {
    this.setData({
      results: this.data.results.map(updater)
    })
  },

  setEnhanceLoading(resultKey, loading) {
    this.updateResultLists((item) =>
      item.resultKey === resultKey ? { ...item, isEnhancing: loading } : item
    )
  },

  mergeEnhancedReply(resultKey, reply) {
    this.updateResultLists((item) => {
      if (item.resultKey !== resultKey) return item
      return {
        ...item,
        localReply: item.localReply || generateWithLocalCard(item.card),
        card: {
          ...item.card,
          ...reply
        }
      }
    })
  },

  /* ---------- 交互 handlers ---------- */

  onMoodTap(event) {
    const mood = event.currentTarget.dataset.mood
    if (!mood || mood === this.data.activeMood) return
    tapFeedback()
    const tab = this.data.moodTabs.find((item) => item.id === mood)
    this.setData({
      activeMood: mood,
      activeMoodLabel: tab ? tab.name : mood
    })
  },

  copyText(event) {
    const text = event.currentTarget.dataset.text || ""
    copyToClipboard(text, "已复制")
  },

  copyReplyField(event) {
    const index = Number(event.currentTarget.dataset.index) || 0
    const field = event.currentTarget.dataset.field
    const item = this.data.results[index]
    const text = item && item.card ? item.card[field] : ""
    const title = event.currentTarget.dataset.title || "已复制"
    copyToClipboard(text, title)
  },

  copyCard(event) {
    const index = Number(event.currentTarget.dataset.index)
    const text = buildCardText(this.data.results[index])
    if (!text) return
    copyToClipboard(text, "已复制整张")
  },

  copyAll() {
    const text = this.data.results.map(buildCardText).filter(Boolean).join("\n\n---\n\n")
    copyToClipboard(text, "已复制全部")
  },

  toggleExpand(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    const results = this.data.results.map((item, i) =>
      i === index ? { ...item, expanded: !item.expanded } : item
    )
    this.setData({ results })
  },

  onToggleFavorite(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    const item = this.data.results[index]
    if (!item || !item.card || !item.card.id) return
    tapFeedback()
    try {
      const snapshot = {
        id: item.card.id,
        category: item.card.category,
        claim: item.card.claim,
        short_reply: item.card.short_reply
      }
      const nowFavorited = storage.toggleFavorite(item.card.id, snapshot)
      const results = this.data.results.map((r, i) =>
        i === index ? { ...r, isFavorited: nowFavorited } : r
      )
      this.setData({ results })
      wx.showToast({
        title: nowFavorited ? "已收藏" : "已取消收藏",
        icon: nowFavorited ? "success" : "none"
      })
    } catch (e) {}
  },

  async onEnhanceReply(event) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.results[index]
    if (!item || item.isEnhancing) return

    this.setEnhanceLoading(item.resultKey, true)
    const reply = await generateEnhancedReply({
      userQuery: this.data.query,
      matchedCard: item.card,
      corePosition: corePositions.stance
    })
    this.setEnhanceLoading(item.resultKey, false)

    if (!reply) {
      wx.showToast({ title: "AI 暂不可用", icon: "none" })
      return
    }

    this.mergeEnhancedReply(item.resultKey, reply)
    wx.showToast({ title: "已增强", icon: "success" })
  },

  // 跳到「问 AI」多轮聊天页，把对方原话 claim 作为 seed 带过去
  onAskAiTap(event) {
    tapFeedback()
    const claim = (event.currentTarget.dataset.claim || this.data.query || "").trim()
    const url = claim
      ? "/pages/chat/chat?seed=" + encodeURIComponent(claim)
      : "/pages/chat/chat"
    wx.navigateTo({ url: url })
  },

  onShareCardLongPress(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    const item = this.data.results[index]
    if (!item || !item.card) return
    tapFeedback()
    this.setData({ shareCanvasVisible: true })
    cardShare.generateShareImage(item.card, {
      canvasId: "shareCanvas",
      pageInstance: this
    }).then((tempFilePath) => {
      wx.showActionSheet({
        itemList: ["保存到相册", "取消"],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success: () => wx.showToast({ title: "已保存到相册", icon: "success" }),
              fail: () => wx.showToast({ title: "保存失败（需要相册权限）", icon: "none" })
            })
          }
        },
        fail: () => {},
        complete: () => this.setData({ shareCanvasVisible: false })
      })
    }).catch(() => {
      wx.showToast({ title: "分享图生成失败", icon: "none" })
      this.setData({ shareCanvasVisible: false })
    })
  },

  /** 顶部"再来一张"小按钮 */
  onAnother() {
    tapFeedback()
    const card = randomCard()
    const alias = (card && card.tags && card.tags[0]) || (card && card.category) || "随机"
    const q = alias
    const normalized = normalizeResults([wrapCard(card, "随机")])
    const titleText = `拆解：${q}`
    this.setData({
      query: q,
      titleText,
      isRandom: true,
      hitCount: normalized.length,
      results: normalized,
      activeMood: "short_reply",
      activeMoodLabel: "短刀"
    })
    if (typeof wx !== "undefined" && wx.setNavigationBarTitle) {
      const navTitle = titleText.length > 16 ? titleText.slice(0, 15) + "…" : titleText
      wx.setNavigationBarTitle({ title: navTitle })
    }
    trackCardViews(normalized)
  },

  /* ---------- 微信原生分享 ---------- */

  onShareAppMessage(event) {
    let claim = ""
    if (event && event.target && event.target.dataset && typeof event.target.dataset.index !== "undefined") {
      const idx = Number(event.target.dataset.index)
      if (this.data.results && this.data.results[idx] && this.data.results[idx].card) {
        claim = this.data.results[idx].card.claim || ""
      }
    }
    return {
      title: claim ? "1 句话怼回「" + claim + "」" : "詹黑逻辑拆解器 · 反驳卡",
      path: `/pages/result/result?query=${encodeURIComponent(this.data.query || "")}`
    }
  },

  onShareTimeline() {
    return {
      title: `「${this.data.query}」拆解 · 詹黑逻辑拆解器`,
      query: `query=${encodeURIComponent(this.data.query || "")}`
    }
  }
})
