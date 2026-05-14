/**
 * Safe wrappers for wx APIs with toast-based error fallback
 */

/** safeCopy(text, successMsg) - wraps setClipboardData with toast on success/failure */
function safeCopy(text, successMsg = "已复制") {
  if (!text) {
    wx.showToast({ title: "没有可复制内容", icon: "none" })
    return
  }
  wx.setClipboardData({
    data: text,
    success: () => wx.showToast({ title: successMsg, icon: "success" }),
    fail: () => wx.showToast({ title: "复制失败，请重试", icon: "none" })
  })
}

/** safeShowEmptyQuery() - toast prompt for empty search */
function safeShowEmptyQuery() {
  wx.showToast({ title: "先输入一个黑点（试试 8分 / Excel球王）", icon: "none", duration: 2000 })
}

/** safeNavigate(url, fallbackMsg) - wraps navigateTo with toast on failure */
function safeNavigate(url, fallbackMsg = "页面打开失败") {
  wx.navigateTo({
    url,
    fail: () => wx.showToast({ title: fallbackMsg, icon: "none" })
  })
}

module.exports = { safeCopy, safeShowEmptyQuery, safeNavigate }
