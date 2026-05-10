const { matchQuery, randomCard } = require("../../utils/matchQuery")
const { generateEnhancedReply } = require("../../utils/llmProvider")
const arsenal = require("../../data/arsenal")
const corePositions = require("../../data/core_positions")

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
  return results.map((item, index) => ({
    resultKey: item.resultKey || (item.card && item.card.id) || `${item.category || "result"}_${index}`,
    ...item
  }))
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

function pickReplyFields(card) {
  return {
    short_reply: card.short_reply,
    long_reply: card.long_reply,
    one_liner: card.one_liner,
    video_script: card.video_script
  }
}

Page({
  data: {
    query: "",
    activeCategory: "全部",
    arsenalStats: {
      cards: allCards.length,
      aliases: arsenal.aliases.length
    },
    categoryFilters: buildCategoryFilters(),
    enhancedLoadingMap: {},
    allResults: [],
    filteredResults: [],
    results: [],
    quickInputs: [
      "8分",
      "米奇冠军",
      "科比五冠",
      "Excel球王",
      "老张跑路",
      "摊皇不回防",
      "库里改变篮球",
      "LeGM"
    ]
  },

  onLoad() {
    this.applyResults(matchQuery("8分"), "全部")
  },

  onInput(event) {
    this.setData({ query: event.detail.value })
  },

  applyResults(results, category) {
    const activeCategory = category || this.data.activeCategory || "全部"
    const filteredResults = normalizeResults(results)
    this.setData({
      activeCategory,
      allResults: filteredResults,
      filteredResults,
      results: filteredResults
    })
  },

  setEnhanceLoading(resultKey, loading) {
    const loadingMap = {
      ...this.data.enhancedLoadingMap,
      [resultKey]: loading
    }
    const markLoading = (item) => item.resultKey === resultKey
      ? { ...item, isEnhancing: loading }
      : item
    this.setData({
      enhancedLoadingMap: loadingMap,
      allResults: this.data.allResults.map(markLoading),
      filteredResults: this.data.filteredResults.map(markLoading),
      results: this.data.results.map(markLoading)
    })
  },

  mergeEnhancedReply(resultKey, reply) {
    const mergeItem = (item) => {
      if (item.resultKey !== resultKey) return item
      return {
        ...item,
        localReply: item.localReply || pickReplyFields(item.card),
        card: {
          ...item.card,
          ...reply
        }
      }
    }
    this.setData({
      allResults: this.data.allResults.map(mergeItem),
      filteredResults: this.data.filteredResults.map(mergeItem),
      results: this.data.results.map(mergeItem)
    })
  },

  onGenerate() {
    const results = matchQuery(this.data.query)
    this.applyResults(results, "全部")
  },

  onQuickTap(event) {
    const value = event.currentTarget.dataset.value
    const results = matchQuery(value)
    this.setData({
      query: value
    })
    this.applyResults(results, "全部")
  },

  onCategoryTap(event) {
    const category = event.currentTarget.dataset.category
    const cards = allCards
      .filter((card) => category === "全部" || card.category === category)
      .map((card) => wrapCard(card, "分类筛选"))
    this.applyResults(cards, category)
  },

  onRandom() {
    const card = randomCard()
    this.setData({ query: card.tags && card.tags.length ? card.tags[0] : card.category })
    this.applyResults([wrapCard(card, "随机")], "全部")
  },

  copyText(event) {
    const text = event.currentTarget.dataset.text || ""
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: "已复制", icon: "success" })
      }
    })
  },

  async onEnhanceReply(event) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.filteredResults[index]
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
    const text = buildCardText(this.data.filteredResults[index])
    if (!text) return
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: "已复制整张", icon: "success" })
      }
    })
  },

  copyAll() {
    const text = this.data.filteredResults.map(buildCardText).filter(Boolean).join("\n\n---\n\n")
    if (!text) {
      wx.showToast({ title: "没有可复制内容", icon: "none" })
      return
    }
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: "已复制全部", icon: "success" })
      }
    })
  }
})
