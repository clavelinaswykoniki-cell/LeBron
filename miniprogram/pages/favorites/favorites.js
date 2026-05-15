const storage = require("../../utils/storage")

function truncate(s, n) {
  if (!s || typeof s !== "string") return ""
  return s.length > n ? s.slice(0, n) + "…" : s
}

function decorate(items) {
  return (items || []).map(it => {
    const snap = it.snapshot || {}
    return {
      id: it.id,
      at: it.at,
      claimShort: truncate(snap.claim || "", 40),
      replyShort: truncate(snap.short_reply || snap.shortReply || "", 60),
      category: snap.category || "",
      hasSnapshot: !!(snap.claim || snap.short_reply || snap.shortReply)
    }
  })
}

Page({
  data: { items: [], empty: false },

  onShow() {
    const raw = storage.getFavorites()
    const items = decorate(raw)
    this.setData({ items, empty: items.length === 0 })
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.reLaunch({ url: `/pages/index/index?focus=${encodeURIComponent(id)}` })
  },

  onUnfavorite(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    storage.toggleFavorite(id)
    const raw = storage.getFavorites()
    const items = decorate(raw)
    this.setData({ items, empty: items.length === 0 })
    wx.showToast({ title: "已取消收藏", icon: "none" })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  }
})
