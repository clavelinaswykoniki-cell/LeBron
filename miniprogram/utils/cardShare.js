/**
 * 分享卡片图生成。
 *
 * 用法（小程序运行时）：
 *   const { generateShareImage } = require('../../utils/cardShare')
 *   generateShareImage(card, { canvasId: 'shareCanvas', onSuccess, onError })
 *
 * 在 wxml 里必须配套 <canvas canvas-id="shareCanvas" .../>
 *
 * 返回值：Promise<tempFilePath>
 */

const SHARE_CANVAS_WIDTH = 750
const SHARE_CANVAS_HEIGHT = 1334
const BG_GRADIENT_START = "#1a0a2e"
const BG_GRADIENT_END = "#2a1145"
const COLOR_GOLD = "#fbbf24"
const COLOR_LIGHT_PURPLE = "#e9d5ff"
const COLOR_WHITE = "#fef3c7"

const MAX_WRAP_LINES = 5 // 单段最多换行数，超出补"…"

/**
 * 在指定 canvas 上绘制卡片图，并通过 wx.canvasToTempFilePath 导出。
 */
function generateShareImage(card, options) {
  options = options || {}
  return new Promise(function (resolve, reject) {
    if (typeof wx === "undefined" || !wx.createCanvasContext) {
      reject(new Error("wx canvas not available (non-miniprogram env)"))
      return
    }
    if (!card || !card.claim) {
      reject(new Error("invalid card data"))
      return
    }
    const canvasId = options.canvasId || "shareCanvas"
    const pageInstance = options.pageInstance || null
    const ctx = wx.createCanvasContext(canvasId, pageInstance)

    // 背景渐变
    const grad = ctx.createLinearGradient(0, 0, 0, SHARE_CANVAS_HEIGHT)
    grad.addColorStop(0, BG_GRADIENT_START)
    grad.addColorStop(1, BG_GRADIENT_END)
    ctx.setFillStyle(grad)
    ctx.fillRect(0, 0, SHARE_CANVAS_WIDTH, SHARE_CANVAS_HEIGHT)

    // 顶部标题徽章
    ctx.setFillStyle(COLOR_GOLD)
    ctx.setFontSize(36)
    ctx.setTextAlign("center")
    ctx.fillText("逻辑拆解卡", SHARE_CANVAS_WIDTH / 2, 100)

    // 分类标签
    ctx.setFillStyle(COLOR_LIGHT_PURPLE)
    ctx.setFontSize(24)
    ctx.fillText("【" + (card.category || "") + "】", SHARE_CANVAS_WIDTH / 2, 150)

    // 对方话术区（黑底）
    ctx.setFillStyle("rgba(0,0,0,0.4)")
    _roundRect(ctx, 60, 200, SHARE_CANVAS_WIDTH - 120, 240, 18)
    ctx.fill()
    ctx.setFillStyle(COLOR_LIGHT_PURPLE)
    ctx.setFontSize(22)
    ctx.setTextAlign("left")
    ctx.fillText("对方话术：", 80, 240)
    ctx.setFillStyle("#ffffff")
    ctx.setFontSize(28)
    _wrapText(ctx, card.claim, 80, 280, SHARE_CANVAS_WIDTH - 160, 40)

    // 先回这句（金色高亮）
    _drawSection(ctx, "先回这句：", card.short_reply || "", 80, 500, 545, 32, 44)

    // 逻辑漏洞
    if (card.logic_flaw) {
      _drawSection(ctx, "逻辑漏洞：", card.logic_flaw, 80, 800, 840, 24, 36)
    }

    // 同标准对比
    if (card.comparison) {
      _drawSection(ctx, "同标准对比：", card.comparison, 80, 1020, 1060, 24, 36)
    }

    // 底部水印 - jersey 23
    ctx.setFillStyle("rgba(251, 191, 36, 0.15)")
    ctx.setFontSize(180)
    ctx.setTextAlign("right")
    ctx.fillText("23", SHARE_CANVAS_WIDTH - 60, SHARE_CANVAS_HEIGHT - 120)

    // 水印文字
    ctx.setFillStyle(COLOR_LIGHT_PURPLE)
    ctx.setFontSize(22)
    ctx.setTextAlign("left")
    ctx.fillText("詹黑逻辑拆解器 v2.1", 80, SHARE_CANVAS_HEIGHT - 80)

    ctx.draw(false, function () {
      wx.canvasToTempFilePath({
        canvasId: canvasId,
        success: function (res) { resolve(res.tempFilePath) },
        fail: function (err) { reject(err) }
      }, pageInstance)
    })
  })
}

/**
 * 内部 helper：画一组"金色小标题 + 白色正文（自动换行）"
 *
 * @param {string} label    金色 22px 标题文字
 * @param {string} body     正文
 * @param {number} x        统一左对齐 x
 * @param {number} labelY   标题基线 y
 * @param {number} bodyY    正文基线 y
 * @param {number} bodyFont 正文字号
 * @param {number} lineH    正文行高
 */
function _drawSection(ctx, label, body, x, labelY, bodyY, bodyFont, lineH) {
  ctx.setFillStyle(COLOR_GOLD)
  ctx.setFontSize(22)
  ctx.setTextAlign("left")
  ctx.fillText(label, x, labelY)
  if (!body) return
  // short_reply 用 COLOR_WHITE 暖色，其他段用纯白
  ctx.setFillStyle(label === "先回这句：" ? COLOR_WHITE : "#ffffff")
  ctx.setFontSize(bodyFont)
  _wrapText(ctx, body, x, bodyY, SHARE_CANVAS_WIDTH - 160, lineH)
}

/** 圆角矩形 helper */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/**
 * 文本换行 helper：超出 MAX_WRAP_LINES 行截断为 "…"。
 *
 * 注意：早期实现里 maxLine 写死成 5 而 baseline 检查用 lineHeight * 5，
 * 这两个值要一致。这里抽成常量 MAX_WRAP_LINES。
 */
function _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return
  const chars = String(text).split("")
  let line = ""
  let yy = y
  let drawnLines = 0
  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i]
    const metrics = ctx.measureText ? ctx.measureText(test) : { width: test.length * 18 }
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, yy)
      drawnLines += 1
      line = chars[i]
      yy += lineHeight
      if (drawnLines >= MAX_WRAP_LINES) {
        ctx.fillText(line + "…", x, yy)
        return
      }
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, yy)
}

module.exports = {
  generateShareImage: generateShareImage,
  SHARE_CANVAS_WIDTH: SHARE_CANVAS_WIDTH,
  SHARE_CANVAS_HEIGHT: SHARE_CANVAS_HEIGHT
}
