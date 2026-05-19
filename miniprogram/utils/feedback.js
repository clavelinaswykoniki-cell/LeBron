/**
 * 触感 + 提示反馈工具。
 *
 * 统一封装"复制后给用户一个反馈"的小动作：
 *   1. 轻震动（手机微震），让用户在物理上感知到操作成功。
 *   2. Toast 文字提示（success 图标），告诉用户复制了什么。
 *
 * 设计目的：让 page 层不用每次都重复写 `wx.vibrateShort` + `wx.showToast`，
 * 调用一行 `tactileFeedback({ toast: "已复制" })` 就够了。
 *
 * 兼容性：
 *   - `wx.vibrateShort` / `wx.showToast` 在部分低端机或开发工具上可能不存在，
 *     全部做 typeof / 存在性 guard。
 *   - 不抛错，永远静默降级。
 *
 * 注意：本函数 toast 强制使用 success 图标，仅用于成功反馈；
 *      失败/中性提示请用 `utils/safety` 里的 _toast 或直接调 wx.showToast。
 *
 * @param {Object}  [options]
 * @param {boolean} [options.vibrate=true]   是否触发轻震动
 * @param {string}  [options.toast="已复制"] toast 文案，空字符串 / null 则不弹
 * @param {number}  [options.duration=1500]  toast 显示时长（毫秒）
 * @returns {void}
 */
function tactileFeedback({ vibrate = true, toast = "已复制", duration = 1500 } = {}) {
  const hasWx = typeof wx !== "undefined"
  if (vibrate && hasWx && typeof wx.vibrateShort === "function") {
    wx.vibrateShort({ type: "light" })
  }
  if (toast && hasWx && typeof wx.showToast === "function") {
    wx.showToast({ title: toast, icon: "success", duration: duration })
  }
}

module.exports = { tactileFeedback }
