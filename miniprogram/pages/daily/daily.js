/**
 * @file pages/daily/daily.js
 * @description 每日一战页：展示当日固定卡 + 连续签到统计
 */

const daily = require("../../utils/daily")
// duel.js 仅作为后续扩展占位引用，本页面暂不强依赖其方法
let duel = null
try { duel = require("../../utils/duel") } catch (e) { duel = null }

function formatDateLabel() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return y + "年" + m + "月" + day + "日"
}

Page({
  data: {
    dateLabel: "",
    card: null,
    checkin: { streak: 0, totalDays: 0, lastDate: "", todaySigned: false },
    hasDuel: false
  },

  onLoad: function () {
    this.setData({
      dateLabel: formatDateLabel(),
      hasDuel: !!duel
    })
    this._loadCard()
    this._doCheckin()
  },

  onShow: function () {
    // 跨天回到页面时刷新（同一天不会重复签到）
    this.setData({ dateLabel: formatDateLabel() })
    this._loadCard()
    this._doCheckin()
  },

  _loadCard: function () {
    const card = daily.getTodayCard()
    this.setData({ card: card || null })
  },

  _doCheckin: function () {
    const result = daily.recordCheckin()
    this.setData({
      checkin: {
        streak: result.streak,
        totalDays: result.totalDays,
        lastDate: result.lastDate,
        todaySigned: true
      }
    })
    if (result.isNewDay) {
      try {
        wx.showToast({
          title: "签到+1，连续 " + result.streak + " 天",
          icon: "none",
          duration: 1800
        })
      } catch (e) {
        // 非真机环境忽略
      }
    }
  },

  copyShort: function () {
    const card = this.data.card
    if (!card || !card.short_reply) {
      try { wx.showToast({ title: "暂无可复制内容", icon: "none" }) } catch (e) {}
      return
    }
    try {
      wx.setClipboardData({
        data: card.short_reply,
        success: function () {
          try { wx.showToast({ title: "已复制反击文案", icon: "success" }) } catch (e) {}
        },
        fail: function () {
          try { wx.showToast({ title: "复制失败", icon: "none" }) } catch (e) {}
        }
      })
    } catch (e) {
      try { wx.showToast({ title: "复制失败", icon: "none" }) } catch (e2) {}
    }
  },

  goPK: function () {
    try {
      wx.navigateTo({
        url: "/pages/pk/pk",
        fail: function () {
          try { wx.showToast({ title: "页面跳转失败", icon: "none" }) } catch (e) {}
        }
      })
    } catch (e) {}
  },

  goLeaderboard: function () {
    try {
      wx.navigateTo({
        url: "/pages/leaderboard/leaderboard",
        fail: function () {
          try { wx.showToast({ title: "页面跳转失败", icon: "none" }) } catch (e) {}
        }
      })
    } catch (e) {}
  },

  goBack: function () {
    try {
      wx.navigateBack({
        delta: 1,
        fail: function () {
          try { wx.switchTab && wx.switchTab({ url: "/pages/index/index" }) } catch (e) {}
        }
      })
    } catch (e) {}
  },

  onShareAppMessage: function () {
    const card = this.data.card
    const claim = card && card.claim ? card.claim : "今日反驳"
    return {
      title: "今日宿命卡：" + claim,
      path: "/pages/daily/daily"
    }
  },

  onShareTimeline: function () {
    const card = this.data.card
    return {
      title: card && card.claim ? "今日反驳：" + card.claim : "每日反驳 · 詹黑逻辑拆解器",
      query: ""
    }
  }
})
