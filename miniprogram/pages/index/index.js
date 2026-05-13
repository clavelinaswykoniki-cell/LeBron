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

function copyToClipboard(text, title) {
  if (!text) {
    wx.showToast({ title: "没有可复制内容", icon: "none" })
    return
  }
  wx.setClipboardData({
    data: text,
    success: () => {
      wx.showToast({ title, icon: "success" })
    }
  })
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
    isCategoryFiltered: false,
    activeMood: "short_reply",
    activeMoodLabel: "热梗开打",
    moodTabs: [
      { id: "short_reply", name: "热梗开打", field: "short_reply", icon: "thunder" },
      { id: "one_liner", name: "一键复制", field: "one_liner", icon: "copy" },
      { id: "video_script", name: "口播上墙", field: "video_script", icon: "sound" },
      { id: "long_reply", name: "长逻辑压制", field: "long_reply", icon: "chat" }
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
    ]
  },

  onLoad() {
    this.setSearchResults(matchQuery("8分"))
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
      filteredResults: normalized,
      results: normalized
    })
  },

  applyResults(results, category) {
    const activeCategory = category || this.data.activeCategory || "全部"
    const normalized = normalizeResults(results)
    this.setData({
      activeCategory,
      isCategoryFiltered: activeCategory !== "全部",
      filteredResults: normalized,
      results: normalized
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
    this.setSearchResults(matchQuery(this.data.query))
  },

  onQuickTap(event) {
    const value = event.currentTarget.dataset.value
    this.setData({ query: value })
    this.setSearchResults(matchQuery(value))
  },

  onCategoryTap(event) {
    const category = event.currentTarget.dataset.category
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
    if (!mood) return
    const tab = this.data.moodTabs.find((item) => item.id === mood)
    this.setData({
      activeMood: mood,
      activeMoodLabel: tab ? tab.name : mood
    })
  },

  onHotBattleTap(event) {
    const value = event.currentTarget.dataset.value
    this.setData({
      query: value,
      activeMood: "short_reply",
      activeMoodLabel: "热梗开打"
    })
    this.setSearchResults(matchQuery(value))
  },

  onClearCategory() {
    this.applyResults(this.data.allResults, "全部")
  },

  onRandom() {
    const card = randomCard()
    this.setData({ query: card.tags && card.tags.length ? card.tags[0] : card.category })
    this.setSearchResults([wrapCard(card, "随机")])
  },

  copyText(event) {
    const text = event.currentTarget.dataset.text || ""
    copyToClipboard(text, "已复制")
  },

  copyReplyField(event) {
    const index = Number(event.currentTarget.dataset.index)
    const field = event.currentTarget.dataset.field
    const item = this.data.results[index]
    const text = item && item.card ? item.card[field] : ""
    copyToClipboard(text, "已复制")
  },

  copyFirstReply(event) {
    const field = event.currentTarget.dataset.field
    const item = this.data.results[0]
    const text = item && item.card ? item.card[field] : ""
    copyToClipboard(text, "已复制首条")
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
    copyToClipboard(text, "已复制整张")
  },

  copyAll() {
    const text = this.data.filteredResults.map(buildCardText).filter(Boolean).join("\n\n---\n\n")
    copyToClipboard(text, "已复制全部")
  }
})
