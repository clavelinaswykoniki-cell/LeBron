const QUESTIONS = [
  { q: "2011 年总决赛 G4 詹姆斯只拿 8 分，你怎么看？", options: [
    { text: "热火三巨头第一年磨合，战术让韦德主导持球，是阵容错配", score: 1 },
    { text: "我不太熟悉这场比赛", score: 0 },
    { text: "巅峰 MVP 软蛋表现，关键时刻不敢出手", score: -1 }
  ]},
  { q: "2018 年总决赛被勇士横扫，你怎么看？", options: [
    { text: "对手是宇宙勇四巨头，骑士队友只有乐福，单核场均 34+8+10 历史唯一", score: 1 },
    { text: "对手太强 + 队友太弱，两边都有原因", score: 0 },
    { text: "单核就这水平，灭霸詹打不过强队", score: -1 }
  ]},
  { q: "41 岁仍在 NBA 打球，你怎么看？", options: [
    { text: "历史级自律 + 顶级保养，41 岁场均 25+ 是奇迹", score: 1 },
    { text: "还行吧，挺厉害的", score: 0 },
    { text: "占着年轻人位置刷数据", score: -1 }
  ]},
  { q: "决定一加盟热火，你怎么看？", options: [
    { text: "球员有权选择球队，骑士七年没给二当家", score: 1 },
    { text: "各有各的看法，时代不同了", score: 0 },
    { text: "巅峰抱团破坏竞争，开了坏头", score: -1 }
  ]},
  { q: "詹姆斯的历史地位？", options: [
    { text: "历史第一档（GOAT 候选）", score: 1 },
    { text: "历史前五没问题", score: 0 },
    { text: "被高估了，前十都难", score: -1 }
  ]}
]

const RESULTS = [
  { min: 4, max: 5, title: "王牌詹蜜", desc: "对詹姆斯的成就和处境都有深入理解" },
  { min: 2, max: 3, title: "理性詹蜜", desc: "认可詹姆斯但保留独立思考" },
  { min: -1, max: 1, title: "中立观察者", desc: "看球不站队，欣赏所有伟大球员" },
  { min: -3, max: -2, title: "理性詹黑", desc: "对詹姆斯持怀疑态度，但不极端" },
  { min: -5, max: -4, title: "硬核詹黑", desc: "对詹姆斯的不认可态度坚定" }
]

Page({
  data: { questions: QUESTIONS, step: 0, score: 0, finished: false, result: null, total: QUESTIONS.length },
  chooseOption(e) {
    const optionScore = Number(e.currentTarget.dataset.score) || 0
    const newScore = this.data.score + optionScore
    const nextStep = this.data.step + 1
    if (nextStep >= QUESTIONS.length) {
      const result = RESULTS.find(r => newScore >= r.min && newScore <= r.max) || RESULTS[2]
      this.setData({ score: newScore, step: nextStep, finished: true, result })
    } else {
      this.setData({ score: newScore, step: nextStep })
    }
  },
  restart() { this.setData({ step: 0, score: 0, finished: false, result: null }) },
  copyResult() {
    const r = this.data.result
    if (!r) return
    wx.setClipboardData({
      data: `我的詹姆斯态度测试结果：${r.title} —— ${r.desc}`,
      success: () => wx.showToast({ title: "已复制", icon: "success" })
    })
  },
  goBack() { wx.navigateBack({ delta: 1 }) }
})
