App({
  globalData: {
    appName: "詹黑逻辑拆解器"
  },
  onLaunch() {
    // 初始化云能力（用于 wx.cloud.callContainer 调用云托管）
    // env 必须和云托管环境 ID 一致：prod-d1go3yaske515bdb7
    if (typeof wx !== "undefined" && wx.cloud && typeof wx.cloud.init === "function") {
      try {
        wx.cloud.init({
          env: "prod-d1go3yaske515bdb7",
          traceUser: true
        })
      } catch (e) {
        // 静默：基础库太老或环境不支持时降级到 wx.request
        console.warn("[app] wx.cloud.init failed: " + (e && e.message))
      }
    }
  }
})
