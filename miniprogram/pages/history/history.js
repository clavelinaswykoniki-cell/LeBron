const storage = require("../../utils/storage")

/** 把 timestamp 转成 "刚刚 / 3 分钟前 / 2 小时前 / 5 天前 / yyyy-mm-dd" */
function relTime(ts) {
  if (!ts || typeof ts !== "number") return ""
  const diff = Date.now() - ts
  if (diff < 0) return "刚刚"
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "刚刚"
  const min = Math.floor(sec / 60)
  if (min < 60) return min + " 分钟前"
  const hr = Math.floor(min / 60)
  if (hr < 24) return hr + " 小时前"
  const day = Math.floor(hr / 24)
  if (day < 30) return day + " 天前"
  const d = new Date(ts)
  const pad = n => (n < 10 ? "0" + n : "" + n)
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
}

function decorate(items) {
  return (items || []).map(it => ({
    query: it.query,
    at: it.at,
    relTime: relTime(it.at)
  }))
}

Page({
  data: { items: [], empty: false },

  onShow() {
    const raw = storage.getSearchHistory()
    const items = decorate(raw)
    this.setData({ items, empty: items.length === 0 })
  },

  onItemTap(e) {
    const q = e.currentTarget.dataset.q
    if (!q) return
    wx.reLaunch({ url: `/pages/index/index?seed=${encodeURIComponent(q)}` })
  },

  onClear() {
    wx.showModal({
      title: "确认清空",
      content: "确定要清空全部搜索历史吗？",
      success: (r) => {
        if (r.confirm) {
          storage.clearSearchHistory()
          this.setData({ items: [], empty: true })
          wx.showToast({ title: "已清空", icon: "success" })
        }
      }
    })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  }
})
