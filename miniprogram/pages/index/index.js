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

const allCards = arsenal.cards

function buildCategoryFilters() {
  const seen = {}
  const filters = [{ name: "全部", count: allCards.length }]
  allCards.forEach((card) => {
    if (!seen[card.category]) {
      seen[card.category] = 0
    }
    seen[card.category] += 1
  })
  Object.keys(seen)
    .sort((a, b) => seen[b] - seen[a])
    .forEach((name) => filters.push({ name, count: seen[name] }))
  return filters
}

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
    return {
      resultKey: item.resultKey || cardId || `${item.category || "result"}_${index}`,
      isFavorited: cardId ? storage.isFavorited(cardId) : false,
      hasExtended: cardId ? !!extendedById[cardId] : false,
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
      // 记录一次复制，可能解锁勋章
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
  results.forEach((item) => {
    if (!item || !item.card) return
    try {
      const { rankUp, badgesUnlocked } = progression.recordCardView(item.card.id, item.card.category)
      if (rankUp) {
        const snapshot = progression.getCurrentRank()
        setTimeout(() => {
          wx.showToast({ title: "✨ 升段：" + snapshot.rank.name, icon: "none", duration: 2000 })
        }, 800)
      } else if (badgesUnlocked && badgesUnlocked.length) {
        setTimeout(() => {
          wx.showToast({ title: "🏆 解锁勋章：" + badgesUnlocked[0].name, icon: "none", duration: 1800 })
        }, 800)
      }
    } catch (e) {}
  })
}

function tapFeedback() {
  if (typeof wx !== "undefined" && wx.vibrateShort) {
    wx.vibrateShort({ type: "light" })
  }
}

Page({
  data: {
    query: "",
    activeCategory: "全部",
    arsenalStats: {
      cards: allCards.length,
      aliases: arsenal.aliases.length,
      categories: (function () {
        try {
          return new Set(allCards.map(function (c) { return c.category; })).size
        } catch (e) {
          return 0
        }
      })()
    },
    categoryFilters: buildCategoryFilters(),
    allResults: [],
    results: [],
    isCategoryFiltered: false,
    activeMood: "short_reply",
    activeMoodLabel: "短刀",
    moodTabs: [
      { id: "short_reply", name: "短刀", field: "short_reply", icon: "thunder" },
      { id: "one_liner", name: "封口", field: "one_liner", icon: "lightning" },
      { id: "long_reply", name: "长拆", field: "long_reply", icon: "chat" },
      { id: "video_script", name: "口播", field: "video_script", icon: "sound" }
    ],
    hotBattles: [
      { label: "8分释兵权", query: "8分释兵权", tone: "经典硬仗" },
      { label: "米奇冠军", query: "米奇冠军", tone: "冠军含金量" },
      { label: "靠身体没技术", query: "靠身体", tone: "技术审美" },
      { label: "Excel球王", query: "Excel詹", tone: "数据刷子" },
      { label: "跑路抱团", query: "跑路詹", tone: "生涯选择" },
      { label: "库里压詹", query: "库里改变篮球", tone: "球星对比" }
    ],
    quickInputs: [
      "8分",
      "米奇冠军",
      "科比五冠",
      "Excel球王",
      "废队友",
      "不会投篮",
      "老张跑路",
      "摊皇不回防",
      "库里改变篮球",
      "LeGM"
    ],
    rank: null,
    menuEntries: [
      { id: "about", label: "我的段位", emoji: "🏆", url: "/pages/about/about" },
      { id: "quiz", label: "球迷测试", emoji: "🧠", url: "/pages/quiz/quiz" },
      { id: "easter", label: "23号秘藏", emoji: "👑", url: "/pages/easter/easter" },
      { id: "history", label: "搜索历史", emoji: "🕒", url: "/pages/history/history" },
      { id: "favorites", label: "我的收藏", emoji: "⭐", url: "/pages/favorites/favorites" },
      { id: "privacy", label: "隐私说明", emoji: "🛡️", url: "/pages/privacy/privacy" }
    ],
    shareCanvasVisible: false
  },

  onLoad(options) {
    // 首次打开 → onboarding
    try {
      const onboarded = (typeof wx !== "undefined" && wx.getStorageSync)
        ? wx.getStorageSync("lbr_onboarded")
        : true
      if (!onboarded) {
        wx.reLaunch({ url: "/pages/onboarding/onboarding" })
        return
      }
    } catch (e) {}

    // 支持 query 参数 ?seed=... 或 ?focus=cardId
    let seed = "8分"
    if (options && options.seed) {
      try { seed = decodeURIComponent(options.seed) } catch (e) {}
    } else if (options && options.focus) {
      try {
        const focusId = decodeURIComponent(options.focus)
        const focusCard = allCards.find((c) => c.id === focusId)
        if (focusCard) {
          this.setData({ query: focusCard.tags && focusCard.tags[0] || focusCard.category })
          this.setSearchResults([wrapCard(focusCard, "我的收藏")])
          this.refreshRank()
          return
        }
      } catch (e) {}
    }
    this.setData({ query: seed })
    this.setSearchResults(matchQuery(seed))
    this.refreshRank()
  },

  onShow() {
    this.refreshRank()
  },

  refreshRank() {
    try {
      const rank = progression.getCurrentRank()
      this.setData({ rank })
    } catch (e) {}
  },

  onInput(event) {
    this.setData({ query: event.detail.value })
  },

  setSearchResults(results) {
    const normalized = normalizeResults(results)
    this.setData({
      activeCategory: "全部",
      isCategoryFiltered: false,
      allResults: normalized,
      results: normalized
    })
    trackCardViews(normalized)
    this.refreshRank()
  },

  applyResults(results, category) {
    const activeCategory = category || this.data.activeCategory || "全部"
    const normalized = normalizeResults(results)
    this.setData({
      activeCategory,
      isCategoryFiltered: activeCategory !== "全部",
      results: normalized
    })
  },

  updateResultLists(updater) {
    this.setData({
      allResults: this.data.allResults.map(updater),
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

  onGenerate() {
    const q = (this.data.query || "").trim()
    if (!q) {
      safety.safeShowEmptyQuery()
      this.setSearchResults([])
      return
    }
    try { storage.recordSearchHistory(q) } catch (e) {}
    this.setSearchResults(matchQuery(q))
  },

  onQuickTap(event) {
    const value = event.currentTarget.dataset.value
    if (value === this.data.query) return
    tapFeedback()
    this.setData({ query: value })
    this.setSearchResults(matchQuery(value))
  },

  onCategoryTap(event) {
    const category = event.currentTarget.dataset.category
    if (category === this.data.activeCategory) return
    if (category === "全部") {
      this.applyResults(this.data.allResults, "全部")
      return
    }
    const cards = allCards
      .filter((card) => card.category === category)
      .map((card) => wrapCard(card, "分类筛选"))
    this.applyResults(cards, category)
  },

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

  onHotBattleTap(event) {
    const value = event.currentTarget.dataset.value
    if (!value || value === this.data.query) return
    tapFeedback()
    this.setData({
      query: value,
      activeMood: "short_reply",
      activeMoodLabel: "短刀"
    })
    this.setSearchResults(matchQuery(value))
  },

  onClearCategory() {
    this.applyResults(this.data.allResults, "全部")
  },

  onRandom() {
    tapFeedback()
    const card = randomCard()
    this.setData({ query: card.tags && card.tags.length ? card.tags[0] : card.category })
    this.setSearchResults([wrapCard(card, "随机")])
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
      wx.showToast({ title: "AI暂不可用", icon: "none" })
      return
    }

    this.mergeEnhancedReply(item.resultKey, reply)
    wx.showToast({ title: "已增强", icon: "success" })
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

  onJerseyLongPress() {
    tapFeedback()
    safety.safeNavigate("/pages/easter/easter", "彩蛋开不了，点错地方了")
  },

  onMenuTap(event) {
    const url = event.currentTarget.dataset.url
    if (!url) return
    tapFeedback()
    safety.safeNavigate(url, "页面打开失败")
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
      const allResults = this.data.allResults.map((r) =>
        r.card && r.card.id === item.card.id ? { ...r, isFavorited: nowFavorited } : r
      )
      this.setData({ results, allResults })
      wx.showToast({
        title: nowFavorited ? "已收藏" : "已取消收藏",
        icon: nowFavorited ? "success" : "none"
      })
    } catch (e) {}
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
          this.setData({ shareCanvasVisible: false })
        },
        fail: () => this.setData({ shareCanvasVisible: false })
      })
    }).catch(() => {
      wx.showToast({ title: "分享图生成失败", icon: "none" })
      this.setData({ shareCanvasVisible: false })
    })
  }
})
