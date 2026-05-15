const duel = require("../../utils/duel")

Page({
  data: {
    players: [],
    myRank: null
  },

  onShow: function () {
    try {
      const players = duel.getLeaderboard() || []
      const myRank = duel.getMyRank() || null
      this.setData({
        players: players,
        myRank: myRank
      })
    } catch (e) {
      this.setData({
        players: [],
        myRank: null
      })
    }
  },

  goPK: function () {
    wx.navigateTo({
      url: "/pages/pk/pk"
    })
  },

  goBack: function () {
    wx.navigateBack()
  }
})
