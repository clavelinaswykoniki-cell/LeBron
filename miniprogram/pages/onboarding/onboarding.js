const userProfile = require("../../utils/userProfile")

const STEPS = [
  {
    id: "s0",
    type: "intro",
    title: "欢迎来到弹药库",
    desc: "詹黑逻辑拆解器 v2.6\n175 反驳卡 / 559 别名 / 46 类争议",
    emoji: "👑",
    cta: "下一步"
  },
  {
    id: "s1",
    type: "intro",
    title: "输入黑点，秒出反驳",
    desc: "输入 \"8 分释兵权\" / \"Excel 球王\" / \"米奇冠军\"\n系统自动拆解成 4 种回复模式",
    emoji: "🔍",
    cta: "下一步"
  },
  {
    id: "s2",
    type: "intro",
    title: "复制爽感 + 段位升级",
    desc: "复制反驳卡有震动 + 金光特效\n阅读 / 复制累计解锁段位（青铜 → 王者）",
    emoji: "🏆",
    cta: "下一步"
  },
  {
    id: "s3",
    type: "intro",
    title: "23 号秘藏 · 长按解锁",
    desc: "首页 jersey 23 长按触发彩蛋\n生涯里程碑 + 历史第一人宣言",
    emoji: "✨",
    cta: "下一步"
  },
  {
    id: "s4",
    type: "profile",
    title: "起个名字，戴上头像",
    desc: "排行榜和 PK 战绩会用到\n不填也行，可以以后改",
    cta: "完成"
  }
]

Page({
  data: {
    step: 0,
    steps: STEPS,
    total: STEPS.length,
    current: STEPS[0],
    avatarUrl: "",
    nickname: ""
  },

  onLoad() {
    // 已有 profile 就预填，方便修改重进
    try {
      const p = userProfile.getProfile()
      this.setData({
        avatarUrl: p.avatar_url || "",
        nickname: p.nickname || ""
      })
    } catch (e) {}
  },

  next() {
    const cur = this.data.current
    if (cur && cur.type === "profile") {
      this.saveAndFinish()
      return
    }
    const nextIdx = this.data.step + 1
    if (nextIdx >= STEPS.length) {
      this.saveAndFinish()
      return
    }
    this.setData({ step: nextIdx, current: STEPS[nextIdx] })
  },

  skip() {
    // 跳过 = 不强制填资料，但 openid 仍会自动生成
    this.finish()
  },

  onChooseAvatar(e) {
    if (e && e.detail && e.detail.avatarUrl) {
      this.setData({ avatarUrl: e.detail.avatarUrl })
    }
  },

  onNicknameInput(e) {
    const v = e && e.detail && typeof e.detail.value === "string" ? e.detail.value.trim() : ""
    this.setData({ nickname: v })
  },

  saveAndFinish() {
    try {
      userProfile.setProfile({
        nickname: this.data.nickname || "",
        avatar_url: this.data.avatarUrl || ""
      })
    } catch (e) {}
    this.finish()
  },

  finish() {
    try {
      if (typeof wx !== "undefined" && wx.setStorageSync) {
        wx.setStorageSync("lbr_onboarded", true)
      }
    } catch (e) {}
    wx.reLaunch({ url: "/pages/index/index" })
  }
})
