function loadIndexPage(wxMock) {
  const pagePath = require.resolve("../miniprogram/pages/index/index.js")
  delete require.cache[pagePath]
  let pageConfig
  global.Page = (config) => {
    pageConfig = config
  }
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

async function testCloudMissingFallback() {
  const toasts = []
  const page = loadIndexPage({
    showToast(payload) {
      toasts.push(payload.title)
    },
    setClipboardData() {}
  })
  page.onLoad()
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "cloud missing should keep local reply")
  assert(toasts.includes("AI暂不可用"), "cloud missing should show fallback toast")
}

async function testCloudFailureFallback() {
  const toasts = []
  const page = loadIndexPage({
    cloud: {
      callFunction({ fail }) {
        fail(new Error("mock cloud failure"))
      }
    },
    showToast(payload) {
      toasts.push(payload.title)
    },
    setClipboardData() {}
  })
  page.onLoad()
  const before = page.data.results[0].card.short_reply
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  const after = page.data.results[0].card.short_reply
  assert(before === after, "cloud failure should keep local reply")
  assert(toasts.includes("AI暂不可用"), "cloud failure should show fallback toast")
}

async function testCloudSuccessMerge() {
  const page = loadIndexPage({
    cloud: {
      callFunction({ success }) {
        success({
          result: {
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
    },
    showToast() {},
    setClipboardData() {}
  })
  page.onLoad()
  await page.onEnhanceReply({ currentTarget: { dataset: { index: 0 } } })
  assert(page.data.results[0].card.short_reply === "增强短回复", "cloud success should merge enhanced short reply")
  assert(page.data.results[0].localReply.short_reply, "cloud success should preserve local reply")
}

async function main() {
  await testCloudMissingFallback()
  await testCloudFailureFallback()
  await testCloudSuccessMerge()
  console.log("ai enhance fallback ok")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
