const duel = require("../../utils/duel")
const safety = require("../../utils/safety")
const { tactileFeedback } = require("../../utils/feedback")

Page({
  data: {
    players: [],
    myRank: null
  },

  onShow: function () {
    try {
      // 单次 getLeaderboard 一次性导出全部，避免重复调用导致重排
      const players = duel.getLeaderboard() || []
      const me = players.find(function (p) { return p && p.isMe }) || null
      const myRank = me
        ? {
            rank: me.rank,
            total: players.length,
            score: me.score,
            nickname: me.name,
            tier: duel.RANK_TIERS.slice().reverse().find(function (t) {
              return me.score >= t.threshold
            }) || duel.RANK_TIERS[0]
          }
        : null
      this.setData({ players: players, myRank: myRank })
    } catch (e) {
      this.setData({ players: [], myRank: null })
    }
  },

  goPK: function () {
    tactileFeedback({ vibrate: true, toast: "" })
    safety.safeNavigate("/pages/pk/pk", "PK 页面打开失败")
  }
})
