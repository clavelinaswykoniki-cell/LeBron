/**
 * pages/chat/chat.js — 「问 AI」多轮对话页
 *
 * 入口：
 *   1. 首页主入口按钮 → 不带参
 *   2. 结果页 "AI 增强" 升级版 → 带 seed=对方原话，会自动填到输入框（不自动发送）
 *
 * 状态机：
 *   - messages: [{ role: "user"|"assistant"|"system_tip", content, id }] 渲染列表
 *     注：system_tip 是本地 UI 提示（如开场白、错误提示），不发到后端。
 *   - input: 输入框 string
 *   - isLoading: 正在等 AI 回复（屏蔽重复发送 + 显示打字气泡）
 *   - scrollIntoView: 当前要滚到的元素 id（每加一条消息就更新）
 *
 * 后端约定：见 server/routes/chat.js
 *   POST /api/llm/chat  body: { openid, messages: [{role, content}] }
 *   resp: { ok: true, reply: { content } }
 */

const api = require("../../utils/api")

// userProfile 提供伪 openid（后端配额 Phase 2 用）。如果模块不存在，降级到本地随机。
let userProfile = null
try {
  userProfile = require("../../utils/userProfile")
} catch (e) {
  userProfile = null
}

const REQUEST_TIMEOUT_MS = 35000 // 后端 30s + 网络 5s 缓冲

function tapFeedback() {
  if (typeof wx !== "undefined" && wx.vibrateShort) {
    wx.vibrateShort({ type: "light" })
  }
}

function genMsgId() {
  return "m_" + Date.now() + "_" + Math.floor(Math.random() * 10000)
}

function getOpenid() {
  // 优先 userProfile.getOrCreateOpenId()（utils/userProfile.js 实际导出名）
  // 否则用 storage 里持久化的一个 fake id
  try {
    if (userProfile && typeof userProfile.getOrCreateOpenId === "function") {
      const id = userProfile.getOrCreateOpenId()
      if (id) return id
    }
  } catch (e) {}
  try {
    if (typeof wx !== "undefined" && wx.getStorageSync) {
      let id = wx.getStorageSync("lbr_fake_openid")
      if (!id) {
        id = "anon_" + Date.now() + "_" + Math.floor(Math.random() * 100000)
        wx.setStorageSync("lbr_fake_openid", id)
      }
      return id
    }
  } catch (e) {}
  return "anon_local"
}

Page({
  data: {
    /** 渲染列表：包含本地 tip + 真实 user/assistant 消息 */
    messages: [],
    /** 输入框内容 */
    input: "",
    /** 是否正在等 AI 响应 */
    isLoading: false,
    /** 让 scroll-view 滚动到这个 id */
    scrollIntoView: "",
    /** 输入框焦点（发送后自动重新聚焦） */
    inputFocus: false,
    /** 占位文案 */
    placeholder: "聊聊 NBA / 篮球 / 球员",
    /** 推荐提问（空状态时显示） */
    suggestions: [
      "詹姆斯 vs 乔丹谁更强",
      "约基奇被吹太狠了吧",
      "再凶一点，对方说詹姆斯抱团",
      "杜兰特 2016 算抱团吗"
    ]
  },

  onLoad(options) {
    options = options || {}

    // 开场白（本地 tip，不发后端）
    const intro = {
      id: genMsgId(),
      role: "system_tip",
      content: "我只聊 NBA / 篮球 / 球员。把对方那句话发给我，我帮你拆。"
    }
    const messages = [intro]

    // 从 result 页跳过来时带的 seed：预填到输入框，不自动发
    let seedText = ""
    if (options.seed) {
      try { seedText = decodeURIComponent(options.seed) } catch (e) { seedText = options.seed }
    }
    seedText = (seedText || "").trim().slice(0, 500)

    this.setData({
      messages: messages,
      input: seedText,
      scrollIntoView: intro.id,
      inputFocus: !!seedText
    })

    if (typeof wx !== "undefined" && wx.setNavigationBarTitle) {
      wx.setNavigationBarTitle({ title: "问 AI · 篮球" })
    }
  },

  onInput(event) {
    this.setData({ input: event.detail.value })
  },

  onSuggestionTap(event) {
    const text = event.currentTarget.dataset.text || ""
    if (!text) return
    tapFeedback()
    this.setData({ input: text, inputFocus: true })
  },

  /** 用户点发送 */
  async onSend() {
    if (this.data.isLoading) return
    const text = (this.data.input || "").trim()
    if (!text) {
      wx.showToast({ title: "说点啥呢", icon: "none" })
      return
    }
    if (text.length > 500) {
      wx.showToast({ title: "太长了，500 字内", icon: "none" })
      return
    }
    tapFeedback()

    // 1. 把 user message append 进列表，清空输入框
    const userMsg = { id: genMsgId(), role: "user", content: text }
    const nextMessages = this.data.messages.concat([userMsg])
    this.setData({
      messages: nextMessages,
      input: "",
      isLoading: true,
      scrollIntoView: userMsg.id,
      inputFocus: false
    })

    // 2. 准备发送给后端的 history（剔除本地 tip）
    const historyForApi = nextMessages
      .filter(function (m) { return m.role === "user" || m.role === "assistant" })
      .map(function (m) { return { role: m.role, content: m.content } })

    // 3. 调后端
    let assistantContent = ""
    let errMsg = ""
    try {
      const resp = await api.post(
        "/api/llm/chat",
        { openid: getOpenid(), messages: historyForApi },
        { timeout: REQUEST_TIMEOUT_MS }
      )
      if (resp && resp.ok && resp.reply && typeof resp.reply.content === "string") {
        assistantContent = resp.reply.content.trim()
      } else {
        errMsg = (resp && resp.message) || "AI 返回异常，再试一次"
      }
    } catch (e) {
      errMsg = e && e.message ? e.message : "网络开小差，再试一次"
      // 友化常见错误
      if (e && e.network) errMsg = "网络断了，看下信号再发一次"
      if (e && e.statusCode === 502) errMsg = "AI 暂时回不上来，等几秒再试"
      if (e && e.statusCode === 503) errMsg = "AI 服务没开，跟管理员说一声"
    }

    // 4. 把回复 append 进列表
    if (assistantContent) {
      const aiMsg = { id: genMsgId(), role: "assistant", content: assistantContent }
      this.setData({
        messages: this.data.messages.concat([aiMsg]),
        isLoading: false,
        scrollIntoView: aiMsg.id,
        inputFocus: true
      })
    } else {
      // 失败：toast + 留一条 system_tip 在气泡流里方便用户看
      wx.showToast({ title: errMsg || "AI 暂不可用", icon: "none" })
      const tip = {
        id: genMsgId(),
        role: "system_tip",
        content: "（这条没发出去：" + (errMsg || "未知错误") + "）"
      }
      this.setData({
        messages: this.data.messages.concat([tip]),
        isLoading: false,
        scrollIntoView: tip.id,
        inputFocus: true
      })
    }
  },

  /** 长按消息：复制 */
  onMsgLongPress(event) {
    const id = event.currentTarget.dataset.id
    const msg = this.data.messages.find(function (m) { return m.id === id })
    if (!msg || !msg.content) return
    wx.setClipboardData({
      data: msg.content,
      success: function () {
        wx.showToast({ title: "已复制", icon: "success" })
      }
    })
  },

  /** 清空对话 */
  onClear() {
    if (this.data.isLoading) return
    if (this.data.messages.length <= 1) return
    const that = this
    wx.showModal({
      title: "清空当前对话？",
      content: "清空后无法恢复",
      confirmText: "清空",
      confirmColor: "#7c3aed",
      success: function (res) {
        if (!res.confirm) return
        const intro = {
          id: genMsgId(),
          role: "system_tip",
          content: "我只聊 NBA / 篮球 / 球员。把对方那句话发给我，我帮你拆。"
        }
        that.setData({
          messages: [intro],
          input: "",
          scrollIntoView: intro.id
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "跟 AI 聊 NBA · 詹黑逻辑拆解器",
      path: "/pages/chat/chat"
    }
  }
})
