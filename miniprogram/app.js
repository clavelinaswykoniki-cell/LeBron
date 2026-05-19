// 标记云能力是否已初始化（避免 HMR / 重复 onLaunch 时重复 init）
let _cloudInited = false

App({
  globalData: {
    appName: "詹黑逻辑拆解器",
    // 暴露给 utils/api.js 在云调用不可用时检查（基础库 <2.13.0 等老客户端）
    cloudReady: false
  },
  onLaunch() {
    // 初始化云能力（用于 wx.cloud.callContainer 调用云托管）
    // env 必须和云托管环境 ID 一致：prod-d1go3yaske515bdb7
    if (_cloudInited) {
      this.globalData.cloudReady = true
      return
    }
    if (typeof wx !== "undefined" && wx.cloud && typeof wx.cloud.init === "function") {
      try {
        wx.cloud.init({
          env: "prod-d1go3yaske515bdb7",
          traceUser: true
        })
        _cloudInited = true
        this.globalData.cloudReady = true
      } catch (e) {
        // 静默：基础库太老或环境不支持时降级到 wx.request
        // 注意：fallback 用的 *.sh.run.tcloudbase.com 在生产环境已被微信拒收，
        // 此时只是为了让本地开发/旧客户端不彻底崩，真实生产体验会 degrade。
        console.warn("[app] wx.cloud.init failed: " + (e && e.message))
        this.globalData.cloudReady = false
      }
    } else {
      // 基础库 <2.2.3 没有 wx.cloud，或 <2.13.0 没有 callContainer
      console.warn("[app] wx.cloud not available — 请升级微信到最新版（基础库 ≥2.13.0）")
      this.globalData.cloudReady = false
    }
  }
})
