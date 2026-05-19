const duel = require("../../utils/duel")
const safety = require("../../utils/safety")
const { tactileFeedback } = require("../../utils/feedback")

Page({
  data: {
    players: [],
    myRank: null,
    loading: false,
    fromServer: false,    // true: 服务端真实数据；false: 本地 mock 降级
    errorTip: ""           // 仅在拉取失败时显示一条小提示
  },

  onShow: function () {
    // 立刻显示本地数据避免白屏，再异步刷新
    try {
      const localPlayers = duel.getLeaderboard() || []
      const me = localPlayers.find(function (p) { return p && p.isMe }) || null
      this.setData({
        players: localPlayers,
        myRank: this._buildMyRank(me, localPlayers.length),
        loading: true,
        fromServer: false,
        errorTip: ""
      })
    } catch (e) {
      this.setData({ players: [], myRank: null, loading: true })
    }

    // 异步从后端拉真实排行
    const self = this
    duel.fetchLeaderboard({ limit: 50 })
      .then(function (resp) {
        const players = (resp && resp.players) || []
        const me = players.find(function (p) { return p && p.isMe }) || null
        self.setData({
          players: players,
          myRank: self._buildMyRank(me, players.length),
          loading: false,
          fromServer: !!(resp && resp.fromServer),
          errorTip: resp && resp.fromServer ? "" : "（当前显示本地榜单，连不上服务器）"
        })
      })
      .catch(function (e) {
        // 极端情况：fallback 也炸了
        self.setData({
          loading: false,
          errorTip: "（当前显示本地榜单，连不上服务器）"
        })
      })
  },

  _buildMyRank: function (me, total) {
    if (!me) return null
    return {
      rank: me.rank,
      total: total,
      score: me.score,
      nickname: me.name,
      tier: duel.RANK_TIERS.slice().reverse().find(function (t) {
        return me.score >= t.threshold
      }) || duel.RANK_TIERS[0]
    }
  },

  goPK: function () {
    tactileFeedback({ vibrate: true, toast: "" })
    safety.safeNavigate("/pages/pk/pk", "PK 页面打开失败")
  },

  onShareAppMessage: function () {
    const me = this.data.myRank
    const title = me && me.rank
      ? "我在詹黑 PK 排到第 " + me.rank + " 名，敢挑战吗？"
      : "詹黑 PK 段位赛 · 看我排第几"
    return { title: title, path: "/pages/leaderboard/leaderboard" }
  },

  onShareTimeline: function () {
    const me = this.data.myRank
    const title = me && me.score
      ? "詹黑 PK 我 " + me.score + " 分，排第 " + me.rank + " 名"
      : "詹黑 PK 段位排行榜"
    return { title: title, query: "" }
  }
})
