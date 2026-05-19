/**
 * memeShare.js — 把反驳文字叠加到梗图模板上生成图片
 *
 * 模板从 miniprogram/assets/meme-templates/manifest.js 读取，
 * 没有模板时退化为紫金渐变背景。
 *
 * 用法（页面里）：
 *   const { generateMemeImage } = require('../../utils/memeShare')
 *   generateMemeImage(card, {
 *     canvasId: 'memeCanvas',
 *     pageInstance: this,
 *     template: { id, name, file, textPosition, textColor }  // 可选
 *   }).then(tempFilePath => { ... })
 *
 * 配套 wxml：<canvas canvas-id="memeCanvas" class="hidden-canvas"/>
 */

const W = 750
const H = 1334

const COLORS = {
  white: "#ffffff",
  gold: "#fbbf24",
  black: "#0f172a"
}

function _wrapText(ctx, text, maxWidth) {
  const lines = []
  let line = ""
  const chars = String(text || "").split("")
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (ch === "\n") {
      if (line) lines.push(line)
      line = ""
      continue
    }
    const test = line + ch
    const w = ctx.measureText(test).width
    if (w > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * 主入口
 */
function generateMemeImage(card, options) {
  options = options || {}
  return new Promise(function (resolve, reject) {
    if (typeof wx === "undefined" || !wx.createCanvasContext) {
      reject(new Error("wx canvas not available (非小程序环境)"))
      return
    }
    if (!card || !card.short_reply) {
      reject(new Error("invalid card data"))
      return
    }
    const canvasId = options.canvasId || "memeCanvas"
    const pageInstance = options.pageInstance || null
    const template = options.template || null

    function _finalDraw(bgImagePath) {
      const ctx = wx.createCanvasContext(canvasId, pageInstance)

      if (bgImagePath) {
        // 模板图铺满
        ctx.drawImage(bgImagePath, 0, 0, W, H)
      } else {
        // 退化：紫金渐变
        const grad = ctx.createLinearGradient(0, 0, 0, H)
        grad.addColorStop(0, "#1a0a2e")
        grad.addColorStop(1, "#2a1145")
        ctx.setFillStyle(grad)
        ctx.fillRect(0, 0, W, H)
      }

      // 文字定位
      const textPos = (template && template.textPosition) || "bottom"
      const textColor = COLORS[(template && template.textColor) || "white"] || COLORS.white
      const overlayHeight = H * 0.35

      let overlayY
      if (textPos === "top") overlayY = 0
      else if (textPos === "center") overlayY = H * 0.32
      else overlayY = H - overlayHeight // bottom

      // 半透明黑底加可读性
      ctx.setFillStyle("rgba(0, 0, 0, 0.55)")
      ctx.fillRect(0, overlayY, W, overlayHeight)

      // 紫金描边带子（顶/底各一条细线）
      ctx.setFillStyle("rgba(251, 191, 36, 0.7)")
      ctx.fillRect(0, overlayY, W, 3)
      ctx.fillRect(0, overlayY + overlayHeight - 3, W, 3)

      // 主反驳文字（short_reply 加粗大字）
      const reply = String(card.short_reply || "").trim()
      ctx.setFillStyle(textColor)
      ctx.setFontSize(46)
      ctx.font = "bold 46px sans-serif"
      ctx.setTextAlign("center")

      const padding = 50
      const maxWidth = W - padding * 2
      const lines = _wrapText(ctx, reply, maxWidth)
      const maxLines = 4 // 防止文字太多溢出
      const drawnLines = lines.slice(0, maxLines)
      if (lines.length > maxLines) {
        drawnLines[drawnLines.length - 1] =
          drawnLines[drawnLines.length - 1].slice(0, -1) + "…"
      }

      const lineHeight = 64
      const totalH = drawnLines.length * lineHeight
      const startY = overlayY + (overlayHeight - totalH) / 2 + 40
      drawnLines.forEach(function (ln, i) {
        ctx.fillText(ln, W / 2, startY + i * lineHeight)
      })

      // claim 副标题（小字，下方）
      if (card.claim) {
        ctx.setFillStyle("rgba(255, 255, 255, 0.75)")
        ctx.setFontSize(24)
        ctx.font = "24px sans-serif"
        const claimY = overlayY + overlayHeight - 50
        const claimText = "反驳：" + String(card.claim).slice(0, 24)
        ctx.fillText(claimText, W / 2, claimY)
      }

      // 23 号水印（右上）
      ctx.setFillStyle("rgba(251, 191, 36, 0.85)")
      ctx.setFontSize(60)
      ctx.font = "900 60px sans-serif"
      ctx.setTextAlign("right")
      ctx.fillText("23", W - 30, 80)

      // 品牌位（底部）
      ctx.setFillStyle("rgba(255, 255, 255, 0.5)")
      ctx.setFontSize(22)
      ctx.font = "22px sans-serif"
      ctx.setTextAlign("center")
      ctx.fillText("@ 詹黑逻辑拆解器", W / 2, H - 30)

      ctx.draw(false, function () {
        wx.canvasToTempFilePath({
          canvasId: canvasId,
          success: function (res) { resolve(res.tempFilePath) },
          fail: function (err) { reject(new Error((err && err.errMsg) || "canvasToTempFilePath fail")) }
        }, pageInstance)
      })
    }

    // 模板加载
    if (template && template.file) {
      const imgSrc = "/assets/meme-templates/" + template.file
      wx.getImageInfo({
        src: imgSrc,
        success: function (info) {
          _finalDraw(info.path)
        },
        fail: function () {
          // 模板文件找不到 → 退化到渐变
          console.warn("[meme] 模板加载失败，退化到渐变: " + imgSrc)
          _finalDraw(null)
        }
      })
    } else {
      _finalDraw(null)
    }
  })
}

module.exports = {
  generateMemeImage: generateMemeImage
}
