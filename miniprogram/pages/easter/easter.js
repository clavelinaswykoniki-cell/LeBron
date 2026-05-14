Page({
  data: {
    hero: "Strive for Greatness",
    milestones: [
      "4 冠 4 FMVP",
      "4 MVP 历史唯三",
      "历史得分王（40000+ 唯一）",
      "唯一 40000 + 10000 + 10000",
      "41 岁仍场均 25+",
      "21 个全明星",
      "总决赛三双唯一"
    ]
  },
  goHome() {
    // easter 不在 tabBar，所以失败时直接 reLaunch 到首页
    wx.navigateBack({
      delta: 1,
      fail: () => wx.reLaunch({ url: "/pages/index/index" })
    })
  }
})
