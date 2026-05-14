/**
 * 触感 + 提示反馈工具。
 *
 * 统一封装“复制后给用户一个反馈”的小动作：
 *   1. 轻震动（手机微震），让用户在物理上感知到操作成功。
 *   2. Toast 文字提示，告诉用户复制了什么。
 *
 * 设计目的：让 page 层不用每次都重复写 `wx.vibrateShort` + `wx.showToast`，
 * 调用一行 `tactileFeedback({ toast: "已复制" })` 就够了。
 *
 * 兼容性：
 *   - `wx.vibrateShort` 在部分低端机或开发工具上可能不存在，做存在性 guard。
 *   - 不抛错，永远静默降级。
 *
 * 未来扩展：将来如果要加“音效反馈”，把 mp3 文件放到
 * `miniprogram/assets/sounds/` 目录下，再在本文件里增加一个
 * `playSound` 分支即可（接 `wx.createInnerAudioContext`）。
 *
 * @param {Object}  [options]
 * @param {boolean} [options.vibrate=true]   是否触发轻震动
 * @param {string}  [options.toast="已复制"] toast 文案，空字符串 / null 则不弹
 * @param {number}  [options.duration=1500]  toast 显示时长（毫秒）
 * @returns {void}
 */
function tactileFeedback({ vibrate = true, toast = "已复制", duration = 1500 } = {}) {
  if (vibrate && typeof wx !== "undefined" && wx.vibrateShort) {
    wx.vibrateShort({ type: "light" })
  }
  if (toast && typeof wx !== "undefined" && wx.showToast) {
    wx.showToast({ title: toast, icon: "success", duration })
  }
}

module.exports = { tactileFeedback }
