const { matchQuery, randomCard } = require("../../utils/matchQuery")

Page({
  data: {
    query: "",
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
    this.setData({ results: matchQuery("8分") })
  },

  onInput(event) {
    this.setData({ query: event.detail.value })
  },

  onGenerate() {
    const results = matchQuery(this.data.query)
    this.setData({ results })
  },

  onQuickTap(event) {
    const value = event.currentTarget.dataset.value
    this.setData({
      query: value,
      results: matchQuery(value)
    })
  },

  onRandom() {
    const card = randomCard()
    this.setData({
      query: card.tags && card.tags.length ? card.tags[0] : card.category,
      results: [
        {
          alias: "随机",
          category: card.category,
          priority: 1,
          card
        }
      ]
    })
  },

  copyText(event) {
    const text = event.currentTarget.dataset.text || ""
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: "已复制", icon: "success" })
      }
    })
  }
})
