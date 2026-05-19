/**
 * test-ai-enhance-fallback.js
 *
 * 验证 LLM enhance 三种情况都正确：
 *   1. 后端不可达（wx.request 不存在或抛错）→ 保留本地反驳卡 + 弹「AI暂不可用」
 *   2. 后端失败（HTTP 500 / ok:false）→ 保留本地反驳卡 + 弹「AI暂不可用」
 *   3. 后端成功（ok:true + reply）→ 合并增强回复，保留 localReply 备份
 *
 * 注：v2.5+ llmProvider 走 wx.request → /api/llm/enhance（不再走 wx.cloud.callFunction）。
 *     早期版本本测试 mock wx.cloud，已迁移至 wx.request。
 */

function loadIndexPage(wxMock) {
  const pagePath = require.resolve("../miniprogram/pages/index/index.js")
  delete require.cache[pagePath]
  // 同时清掉 llmProvider / api 的 require 缓存，让它们看到新的 wx mock
  try { delete require.cache[require.resolve("../miniprogram/utils/llmProvider")] } catch (e) {}
  try { delete require.cache[require.resolve("../miniprogram/utils/api")] } catch (e) {}

  let pageConfig
  global.Page = (config) => { pageConfig = config }
  global.wx = wxMock
  require(pagePath)

  const page = {
    data: JSON.parse(JSON.stringify(pageConfig.data)),
    setData(patch) {
      this.data = Object.assign({}, this.data, patch)
    }
  }
  Object.keys(pageConfig).forEach((key) => {
    if (typeof pageConfig[key] === "function") {
      page[key] = pageConfig[key].bind(page)
    }
  })
  return page
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

// 1. 后端不可达：mock 里没有 request 函数，api.js 会立即 reject
async function testHttpMissingFallback() {
  const toasts = []
  const page = loadIndexPage({
    // 没有 request 函数
    showToast(payload) { toasts.push(payload.title) },
    setClipboardData() {}
  })
  page.onLoad()
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "http missing should keep local reply")
  assert(toasts.includes("AI暂不可用"), "http missing should show fallback toast")
}

// 2. 后端失败：mock request 触发 fail 回调
async function testHttpFailureFallback() {
  const toasts = []
  const page = loadIndexPage({
    request({ fail }) {
      fail({ errMsg: "request:fail mock network error" })
    },
    showToast(payload) { toasts.push(payload.title) },
    setClipboardData() {}
  })
  page.onLoad()
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "http failure should keep local reply")
  assert(toasts.includes("AI暂不可用"), "http failure should show fallback toast")
}

// 2b. 后端返回非 2xx
async function testHttpNon2xxFallback() {
  const toasts = []
  const page = loadIndexPage({
    request({ success }) {
      success({ statusCode: 502, data: { ok: false, error: "DEEPSEEK_REQUEST_FAILED" } })
    },
    showToast(payload) { toasts.push(payload.title) },
    setClipboardData() {}
  })
  page.onLoad()
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "http 502 should keep local reply")
  assert(toasts.includes("AI暂不可用"), "http 502 should show fallback toast")
}

// 3. 后端成功：mock request 返回 ok:true + reply
async function testHttpSuccessMerge() {
  const page = loadIndexPage({
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
    },
    showToast() {},
    setClipboardData() {}
  })
  page.onLoad()
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  assert(page.data.results[0].card.short_reply === "增强短回复", "http success should merge enhanced short reply")
  assert(page.data.results[0].localReply.short_reply, "http success should preserve local reply")
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
