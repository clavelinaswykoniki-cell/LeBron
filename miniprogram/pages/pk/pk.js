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
    stats: null
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

  shareResult() {
    const score = this.data.result ? this.data.result.score : 0
    safety.safeCopy(
      "我在詹黑逻辑拆解器 PK 拿了 " + score + " 分，来挑战我！",
      "战绩已复制"
    )
  }
})
