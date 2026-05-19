/**
 * 梗图工厂：
 *   - 从 arsenal 里随机抽 12 张反驳卡作候选
 *   - 从 assets/meme-templates/manifest 读模板（用户自维护）
 *   - 用户选 卡 + 选 模板 → canvas 合成（utils/memeShare.js）
 *   - 长按保存 / 点保存按钮 → 写入相册
 */
const arsenal = require("../../data/arsenal")
const memeShare = require("../../utils/memeShare")

let templateManifest = []
try {
  templateManifest = require("../../assets/meme-templates/manifest") || []
  if (!Array.isArray(templateManifest)) templateManifest = []
} catch (e) {
  templateManifest = []
}

// 「无模板（紫金渐变）」永远是第 0 个选项，用户没加图也能用
const GRADIENT_OPTION = {
  id: "__gradient__",
  name: "紫金渐变",
  file: "",
  textPosition: "bottom",
  textColor: "gold",
  isGradient: true
}

function _shuffle(arr) {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = out[i]; out[i] = out[j]; out[j] = t
  }
  return out
}

function _normalizeTemplate(t) {
  if (!t || typeof t !== "object") return null
  if (!t.id || !t.file) return null
  return {
    id: String(t.id),
    name: String(t.name || t.id),
    file: String(t.file),
    textPosition: ["top", "center", "bottom"].indexOf(t.textPosition) >= 0 ? t.textPosition : "bottom",
    textColor: ["white", "gold", "black"].indexOf(t.textColor) >= 0 ? t.textColor : "white",
    isGradient: false
  }
}

Page({
  data: {
    candidates: [],
    selectedCardIndex: -1,
    selectedCard: null,

    templates: [],
    selectedTemplateIndex: 0,
    selectedTemplate: GRADIENT_OPTION,

    generating: false,
    generatedTempPath: ""
  },

  onLoad: function () {
    this._loadCandidates()
    this._loadTemplates()
  },

  _loadCandidates: function () {
    const cards = (arsenal.cards || []).filter(function (c) {
      return c && c.claim && c.short_reply
    })
    const candidates = _shuffle(cards).slice(0, 12)
    this.setData({
      candidates: candidates,
      selectedCardIndex: -1,
      selectedCard: null,
      generatedTempPath: ""
    })
  },

  _loadTemplates: function () {
    const userTemplates = templateManifest
      .map(_normalizeTemplate)
      .filter(function (t) { return t !== null })
    const allTemplates = [GRADIENT_OPTION].concat(userTemplates)
    this.setData({
      templates: allTemplates,
      selectedTemplateIndex: 0,
      selectedTemplate: GRADIENT_OPTION
    })
  },

  pickCard: function (e) {
    const idx = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(idx)) return
    const card = this.data.candidates[idx]
    if (!card) return
    this.setData({
      selectedCardIndex: idx,
      selectedCard: card,
      generatedTempPath: ""
    })
  },

  pickTemplate: function (e) {
    const idx = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(idx)) return
    const tpl = this.data.templates[idx]
    if (!tpl) return
    this.setData({
      selectedTemplateIndex: idx,
      selectedTemplate: tpl,
      generatedTempPath: ""
    })
  },

  reshuffle: function () {
    this._loadCandidates()
  },

  generate: function () {
    const card = this.data.selectedCard
    if (!card) {
      try { wx.showToast({ title: "先选一张反驳卡", icon: "none" }) } catch (e) {}
      return
    }
    if (this.data.generating) return
    this.setData({ generating: true })

    const self = this
    const tpl = this.data.selectedTemplate
    const tplArg = tpl && !tpl.isGradient ? tpl : null

    memeShare.generateMemeImage(card, {
      canvasId: "memeCanvas",
      pageInstance: this,
      template: tplArg
    }).then(function (tempPath) {
      self.setData({ generating: false, generatedTempPath: tempPath })
      try { wx.showToast({ title: "梗图已生成", icon: "success" }) } catch (e) {}
    }).catch(function (err) {
      self.setData({ generating: false })
      try { wx.showToast({ title: "生成失败：" + (err && err.message ? err.message : "未知"), icon: "none" }) } catch (e) {}
    })
  },

  save: function () {
    const path = this.data.generatedTempPath
    if (!path) {
      try { wx.showToast({ title: "请先生成梗图", icon: "none" }) } catch (e) {}
      return
    }
    try {
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: function () { try { wx.showToast({ title: "已保存到相册", icon: "success" }) } catch (e) {} },
        fail: function () { try { wx.showToast({ title: "保存失败（需要相册权限）", icon: "none" }) } catch (e) {} }
      })
    } catch (e) {
      try { wx.showToast({ title: "保存失败", icon: "none" }) } catch (e2) {}
    }
  },

  onShareAppMessage: function () {
    const c = this.data.selectedCard
    return {
      title: c && c.claim ? "1 句话怼回「" + c.claim + "」" : "詹黑梗图工厂",
      path: "/pages/meme/meme",
      imageUrl: this.data.generatedTempPath || undefined
    }
  },

  onShareTimeline: function () {
    return {
      title: "詹黑梗图工厂 · 一句话怼回评论区",
      query: ""
    }
  }
})
