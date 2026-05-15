const duel = require("../../utils/duel")

Page({
  data: {
    match: null,
    step: 0,
    answers: [],
    selectedOption: null,
    showResult: false,
    result: null,
    stats: null
  },

  onLoad() {
    const match = duel.startMatch()
    const stats = duel.getStats()
    this.setData({
      match,
      stats,
      step: 0,
      answers: [],
      selectedOption: null,
      showResult: false,
      result: null
    })
  },

  chooseOption(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ selectedOption: index })
  },

  confirmAnswer() {
    const { selectedOption, answers, step, match } = this.data
    if (selectedOption === null || selectedOption === undefined) {
      return
    }
    const nextAnswers = answers.concat([selectedOption])
    const nextStep = step + 1
    if (nextStep >= 5) {
      const result = duel.submitMatch(match.matchId, nextAnswers, match.questions)
      const stats = duel.getStats()
      this.setData({
        answers: nextAnswers,
        step: nextStep,
        selectedOption: null,
        result,
        stats,
        showResult: true
      })
    } else {
      this.setData({
        answers: nextAnswers,
        step: nextStep,
        selectedOption: null
      })
    }
  },

  restart() {
    const match = duel.startMatch()
    this.setData({
      match,
      step: 0,
      answers: [],
      selectedOption: null,
      showResult: false,
      result: null
    })
  },

  goLeaderboard() {
    wx.navigateTo({ url: '/pages/leaderboard/leaderboard' })
  },

  shareResult() {
    const score = this.data.result ? this.data.result.score : 0
    wx.setClipboardData({
      data: '我在詹黑逻辑拆解器 PK 拿了 ' + score + ' 分，来挑战我！',
      success: () => wx.showToast({ title: '战绩已复制', icon: 'success' }),
      fail: () => wx.showToast({ title: '复制失败', icon: 'none' })
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
