const STEPS = [
  {
    title: "欢迎来到弹药库",
    desc: "詹黑逻辑拆解器 v2.1\n175 反驳卡 / 559 别名 / 46 类争议",
    emoji: "👑",
    cta: "下一步"
  },
  {
    title: "输入黑点，秒出反驳",
    desc: "输入 \"8 分释兵权\" / \"Excel 球王\" / \"米奇冠军\"\n系统自动拆解成 4 种回复模式",
    emoji: "🔍",
    cta: "下一步"
  },
  {
    title: "复制爽感 + 段位升级",
    desc: "复制反驳卡有震动 + 金光特效\n阅读 / 复制累计解锁段位（青铜 → 王者）",
    emoji: "🏆",
    cta: "下一步"
  },
  {
    title: "23 号秘藏 · 长按解锁",
    desc: "首页 jersey 23 长按触发彩蛋\n生涯里程碑 + 历史第一人宣言",
    emoji: "✨",
    cta: "开始使用"
  }
]

Page({
  data: { step: 0, steps: STEPS, total: STEPS.length, current: STEPS[0] },
  next() {
    const next = this.data.step + 1
    if (next >= STEPS.length) {
      this.finish()
      return
    }
    this.setData({ step: next, current: STEPS[next] })
  },
  skip() { this.finish() },
  finish() {
    try {
      if (typeof wx !== "undefined" && wx.setStorageSync) {
        wx.setStorageSync("lbr_onboarded", true)
      }
    } catch (e) {}
    wx.reLaunch({ url: "/pages/index/index" })
  }
})
