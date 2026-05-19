/**
 * test-ai-enhance-fallback.js
 *
 * 验证 LLM enhance 三种情况都正确：
 *   1. 后端不可达（wx.request 不存在或抛错）→ 保留本地反驳卡 + 弹「AI 暂不可用」
 *   2. 后端失败（HTTP 500 / ok:false）→ 保留本地反驳卡 + 弹「AI 暂不可用」
 *   3. 后端成功（ok:true + reply）→ 合并增强回复，保留 localReply 备份
 *
 * v2.7 起 onEnhanceReply 业务逻辑从 pages/index 迁到 pages/result。
 * v2.10 起 utils/api.js 双模式（cloud 优先 + wx.request fallback）；
 * 这里的 wxMock 不带 cloud 字段 → canUseCloudCall 返回 false → 走 wx.request 路径，
 * 跟测试的 mock request 一致。
 */

function loadResultPage(wxMock) {
  const pagePath = require.resolve("../miniprogram/pages/result/result.js")
  delete require.cache[pagePath]
  // 同时清掉 llmProvider / api 的 require 缓存，让它们看到新的 wx mock
  try { delete require.cache[require.resolve("../miniprogram/utils/llmProvider")] } catch (e) {}
  try { delete require.cache[require.resolve("../miniprogram/utils/api")] } catch (e) {}

  let pageConfig
  global.Page = (config) => { pageConfig = config }
  global.wx = wxMock
  require(pagePath)

  const page = {
    data: JSON.parse(JSON.stringify(pageConfig.data || {})),
    setData(patch, cb) {
      this.data = Object.assign({}, this.data, patch)
      if (typeof cb === "function") {
        try { cb() } catch (e) {}
      }
    }
  }
  Object.keys(pageConfig).forEach((key) => {
    if (typeof pageConfig[key] === "function") {
      page[key] = pageConfig[key].bind(page)
    }
  })

  // 手动 inject 测试 fixture（绕过 onLoad 的 matchQuery 复杂度 + wx.navigationBarTitle 副作用）
  // 模拟用户从首页跳过来后 result 页已经渲染了一张反驳卡
  page.data.query = "测试黑点"
  page.data.results = [{
    resultKey: "test_r0",
    isEnhancing: false,
    expanded: false,
    isFavorited: false,
    alias: "测试",
    category: "测试",
    card: {
      id: "test_card",
      claim: "测试黑点",
      short_reply: "本地短回复",
      long_reply: "本地长回复",
      one_liner: "本地金句",
      video_script: "本地口播",
      facts: [],
      tags: []
    }
  }]
  return page
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

// 共享 wx mock 的兜底 helper：所有可能被 utils 调到的 API 都 stub 一下
function baseMock(overrides) {
  return Object.assign({
    showToast: () => {},
    setClipboardData: () => {},
    getStorageSync: () => undefined,
    setStorageSync: () => {},
    vibrateShort: () => {},
    setNavigationBarTitle: () => {},
    pageScrollTo: () => {},
    navigateTo: () => {}
  }, overrides || {})
}

// 1. 后端不可达：mock 里没有 request 函数，api.js 会立即 reject
async function testHttpMissingFallback() {
  const toasts = []
  const page = loadResultPage(baseMock({
    // 没有 request 函数
    showToast(payload) { toasts.push(payload.title) }
  }))
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "http missing should keep local reply")
  assert(toasts.includes("AI 暂不可用"), "http missing should show fallback toast: " + JSON.stringify(toasts))
}

// 2. 后端失败：mock request 触发 fail 回调
async function testHttpFailureFallback() {
  const toasts = []
  const page = loadResultPage(baseMock({
    request({ fail }) {
      fail({ errMsg: "request:fail mock network error" })
    },
    showToast(payload) { toasts.push(payload.title) }
  }))
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "http failure should keep local reply")
  assert(toasts.includes("AI 暂不可用"), "http failure should show fallback toast: " + JSON.stringify(toasts))
}

// 2b. 后端返回非 2xx
async function testHttpNon2xxFallback() {
  const toasts = []
  const page = loadResultPage(baseMock({
    request({ success }) {
      success({ statusCode: 502, data: { ok: false, error: "DEEPSEEK_REQUEST_FAILED" } })
    },
    showToast(payload) { toasts.push(payload.title) }
  }))
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "http 502 should keep local reply")
  assert(toasts.includes("AI 暂不可用"), "http 502 should show fallback toast: " + JSON.stringify(toasts))
}

// 3. 后端成功：mock request 返回 ok:true + reply
async function testHttpSuccessMerge() {
  const page = loadResultPage(baseMock({
    request({ success }) {
      success({
        statusCode: 200,
        data: {
          ok: true,
          reply: {
            short_reply: "增强短回复",
            long_reply: "增强长回复",
            one_liner: "增强一句话",
            video_script: "增强口播"
          }
        }
      })
    }
  }))
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  assert(
    page.data.results[0].card.short_reply === "增强短回复",
    "http success should merge enhanced short reply, got: " + page.data.results[0].card.short_reply
  )
  assert(
    page.data.results[0].localReply && page.data.results[0].localReply.short_reply,
    "http success should preserve local reply on localReply field"
  )
}

async function main() {
  await testHttpMissingFallback()
  await testHttpFailureFallback()
  await testHttpNon2xxFallback()
  await testHttpSuccessMerge()
  console.log("ai enhance fallback ok")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
