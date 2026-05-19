const duel = require("../../utils/duel")
const safety = require("../../utils/safety")
const { tactileFeedback } = require("../../utils/feedback")

Page({
  data: {
    match: null,
    step: 0,
    totalQuestions: 0,
    answers: [],
    selectedOption: null,
    showResult: false,
    result: null,
    stats: null,
    rankUp: { visible: false, title: "", subtitle: "", emoji: "👑" }
  },

  onLoad() {
    const match = duel.startMatch()
    const stats = duel.getStats()
    this.setData({
      match,
      stats,
      step: 0,
      totalQuestions: (match && match.questions) ? match.questions.length : 0,
      answers: [],
      selectedOption: null,
      showResult: false,
      result: null
    })
  },

  chooseOption(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    tactileFeedback({ vibrate: true, toast: "" })
    this.setData({ selectedOption: index })
  },

  confirmAnswer() {
    const { selectedOption, answers, step, match, totalQuestions } = this.data
    if (selectedOption === null || selectedOption === undefined) return
    tactileFeedback({ vibrate: true, toast: "" })
    const nextAnswers = answers.concat([selectedOption])
    const nextStep = step + 1
    if (nextStep >= totalQuestions) {
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
      // 高光时刻：满分或近满分触发庆祝弹窗
      this._maybeShowRankUp(result, stats)
    } else {
      this.setData({
        answers: nextAnswers,
        step: nextStep,
        selectedOption: null
      })
    }
  },

  restart() {
    tactileFeedback({ vibrate: true, toast: "" })
    const match = duel.startMatch()
    this.setData({
      match,
      step: 0,
      totalQuestions: (match && match.questions) ? match.questions.length : 0,
      answers: [],
      selectedOption: null,
      showResult: false,
      result: null
    })
  },

  goLeaderboard() {
    tactileFeedback({ vibrate: true, toast: "" })
    safety.safeNavigate("/pages/leaderboard/leaderboard", "排行榜打开失败")
  },

  goMeme() {
    tactileFeedback({ vibrate: true, toast: "" })
    safety.safeNavigate("/pages/meme/meme", "梗图工厂打开失败")
  },

  shareResult() {
    const score = this.data.result ? this.data.result.score : 0
    safety.safeCopy(
      "我在詹黑逻辑拆解器 PK 拿了 " + score + " 分，来挑战我！",
      "战绩已复制"
    )
  },

  // 根据本局得分决定要不要弹「庆祝」弹窗
  _maybeShowRankUp(result, stats) {
    if (!result) return
    const score = result.score || 0
    let modal = null
    if (score >= 100) {
      modal = { title: "完美一战", subtitle: "5/5 全中", emoji: "👑" }
    } else if (score >= 80) {
      modal = { title: "高光时刻", subtitle: "段位 +" + result.rankChange + " 分", emoji: "🏆" }
    } else if (stats && stats.best && score === stats.best && stats.total > 1) {
      // 新的个人最佳
      modal = { title: "刷新最佳", subtitle: score + " 分新纪录", emoji: "🔥" }
    }
    if (modal) {
      this.setData({ rankUp: Object.assign({ visible: true }, modal) })
    }
  },

  onRankUpClose() {
    this.setData({ "rankUp.visible": false })
  },

  onRankUpShare() {
    // open-type="share" 会自动触发原生分享面板，这里只关掉弹窗
    this.setData({ "rankUp.visible": false })
  },

  // 微信原生「分享给朋友」（聊天会话）
  onShareAppMessage() {
    const score = (this.data.result && this.data.result.score) || 0
    return {
      title: score > 0 ? "我 PK 拿了 " + score + " 分，敢挑战吗？" : "詹黑逻辑拆解器 · PK 段位赛",
      path: "/pages/pk/pk"
    }
  },

  // 微信原生「分享到朋友圈」
  onShareTimeline() {
    const score = (this.data.result && this.data.result.score) || 0
    return {
      title: score > 0 ? "詹黑逻辑 PK · 我 " + score + " 分" : "詹黑逻辑拆解器",
      query: ""
    }
  }
})
