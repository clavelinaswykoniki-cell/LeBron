const { tactileFeedback } = require("../../utils/feedback")
const progression = require("../../utils/progression")
const safety = require("../../utils/safety")
const storage = require("../../utils/storage")
const arsenal = require("../../data/arsenal")

const allCards = arsenal.cards

function tapFeedback() {
  if (typeof wx !== "undefined" && wx.vibrateShort) {
    wx.vibrateShort({ type: "light" })
  }
}

Page({
  data: {
    query: "",
    arsenalStats: {
      cards: allCards.length,
      hits: arsenal.aliases.length,
      categories: (function () {
        try {
          return new Set(allCards.map(function (c) { return c.category; })).size
        } catch (e) {
          return 0
        }
      })()
    },
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
    rank: null
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

    // 支持外部跳转携带 query 参数 ?seed=... 或 ?focus=cardId
    // seed 直接预填入输入框；focus 直接跳到 result 页
    if (options && options.focus) {
      try {
        const focusId = decodeURIComponent(options.focus)
        wx.navigateTo({
          url: "/pages/result/result?focus=" + encodeURIComponent(focusId)
        })
        return
      } catch (e) {}
    }
    if (options && options.seed) {
      try {
        const seed = decodeURIComponent(options.seed)
        this.setData({ query: seed })
      } catch (e) {}
    }
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

  // ============ 跳转型 handler ============
  onGenerate() {
    const q = (this.data.query || "").trim()
    if (!q) {
      safety.safeShowEmptyQuery()
      return
    }
    tapFeedback()
    try { storage.recordSearchHistory(q) } catch (e) {}
    wx.navigateTo({
      url: "/pages/result/result?query=" + encodeURIComponent(q)
    })
  },

  onRandom() {
    tapFeedback()
    wx.navigateTo({
      url: "/pages/result/result?random=1"
    })
  },

  onHotBattleTap(event) {
    const value = event.currentTarget.dataset.value
    if (!value) return
    tapFeedback()
    try { storage.recordSearchHistory(value) } catch (e) {}
    wx.navigateTo({
      url: "/pages/result/result?query=" + encodeURIComponent(value)
    })
  },

  // ============ 本页内交互 ============
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

  onMenuTap(event) {
    const url = event.currentTarget.dataset.url
    if (!url) return
    tapFeedback()
    safety.safeNavigate(url, "页面打开失败")
  },

  // ============ 兼容旧 binding（防御性空函数）============
  // 这些 handler 在新 wxml 已不再 bind，但保留空体避免老代码或残留入口报错
  onQuickTap() {},
  onCategoryTap() {},
  onClearCategory() {},
  onJerseyLongPress() {
    tapFeedback()
    safety.safeNavigate("/pages/easter/easter", "彩蛋开不了，点错地方了")
  },
  setSearchResults() {},
  applyResults() {},

  // ============ 分享 ============
  onShareAppMessage() {
    return {
      title: "詹黑逻辑拆解器 · 215 反驳卡",
      path: "/pages/index/index"
    }
  },

  onShareTimeline() {
    return {
      title: "詹黑逻辑拆解器 · 215 反驳卡 / 730 别名",
      query: ""
    }
  }
})
