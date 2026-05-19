/**
 * Safe wrappers for wx APIs with toast-based error fallback.
 *
 * 设计：任何调用 wx.* 之前都做 typeof guard，确保在非小程序环境（如 node 测试脚本）
 *      下也不会因 wx 未定义而抛错。
 */

function _toast(opts) {
  if (typeof wx !== "undefined" && typeof wx.showToast === "function") {
    wx.showToast(opts)
  }
}

/** safeCopy(text, successMsg) - wraps setClipboardData with toast on success/failure */
function safeCopy(text, successMsg = "已复制") {
  if (!text) {
    _toast({ title: "没有可复制内容", icon: "none" })
    return
  }
  if (typeof wx === "undefined" || typeof wx.setClipboardData !== "function") {
    _toast({ title: "复制失败，请重试", icon: "none" })
    return
  }
  wx.setClipboardData({
    data: text,
    success: () => _toast({ title: successMsg, icon: "success" }),
    fail: () => _toast({ title: "复制失败，请重试", icon: "none" })
  })
}

/** safeShowEmptyQuery() - toast prompt for empty search */
function safeShowEmptyQuery() {
  _toast({ title: "先输入一个黑点（试试 8分 / Excel球王）", icon: "none", duration: 2000 })
}

/** safeNavigate(url, fallbackMsg) - wraps navigateTo with toast on failure */
function safeNavigate(url, fallbackMsg = "页面打开失败") {
  if (typeof wx === "undefined" || typeof wx.navigateTo !== "function") {
    _toast({ title: fallbackMsg, icon: "none" })
    return
  }
  wx.navigateTo({
    url,
    fail: () => _toast({ title: fallbackMsg, icon: "none" })
  })
}

module.exports = { safeCopy, safeShowEmptyQuery, safeNavigate }
