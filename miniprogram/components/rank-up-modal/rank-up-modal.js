/**
 * rank-up-modal — 段位升级 / 高光时刻全屏庆祝弹窗
 *
 * 通用 props（升段、完美 PK、连签 7 天都能复用）：
 *   visible      : Boolean   是否显示
 *   title        : String    顶部强调文案，例 "升段成功" / "完美一战" / "连签 7 天"
 *   subtitle     : String    主体名，例 "钻石詹蜜" / "段位 +30 分"
 *   emoji        : String    大图标，默认 👑
 *
 * 事件：
 *   share : 用户点「分享给朋友」
 *   close : 用户点「继续」或点遮罩
 */
Component({
  properties: {
    visible:  { type: Boolean, value: false },
    title:    { type: String,  value: "升段成功" },
    subtitle: { type: String,  value: "钻石詹蜜" },
    emoji:    { type: String,  value: "👑" }
  },

  data: {
    shown: false
  },

  observers: {
    "visible": function (v) {
      if (v) {
        // 一帧后加 shown 触发 CSS 过渡
        setTimeout(() => { this.setData({ shown: true }) }, 30)
      } else {
        this.setData({ shown: false })
      }
    }
  },

  methods: {
    onClose: function () {
      this.triggerEvent("close")
    },
    onShare: function () {
      this.triggerEvent("share")
    },
    onMaskTap: function () {
      this.triggerEvent("close")
    },
    // catchtap 阻止冒泡到 mask
    onPanelTap: function () {}
  }
})
