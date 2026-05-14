const fs = require("fs")
const path = require("path")

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", file), "utf8"))
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8")
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const pkg = readJson("package.json")
const indexJson = readJson("miniprogram/pages/index/index.json")
const wxml = readText("miniprogram/pages/index/index.wxml")
const wxss = readText("miniprogram/pages/index/index.wxss")
const js = readText("miniprogram/pages/index/index.js")

assert(
  pkg.dependencies && pkg.dependencies["tdesign-miniprogram"],
  "tdesign-miniprogram dependency is required"
)

const usingComponents = indexJson.usingComponents || {}
const requiredComponents = {
  "t-button": "tdesign-miniprogram/button/button",
  "t-tag": "tdesign-miniprogram/tag/tag",
  "t-icon": "tdesign-miniprogram/icon/icon",
  "t-divider": "tdesign-miniprogram/divider/divider"
}

Object.entries(requiredComponents).forEach(([name, componentPath]) => {
  assert(usingComponents[name] === componentPath, `${name} should map to ${componentPath}`)
})

const requiredWxmlTokens = [
  "court-hero",
  "23",
  "紫金弹药库",
  "热梗开打",
  "短刀",
  "封口",
  "长拆",
  "口播",
  "t-button",
  "t-tag",
  "t-icon",
  "t-divider"
]

requiredWxmlTokens.forEach((token) => {
  assert(wxml.includes(token), `index.wxml missing ${token}`)
})

const requiredJsTokens = [
  "moodTabs",
  "activeMood",
  "hotBattles",
  "onMoodTap",
  "copyReplyField",
  "updateResultLists"
]

requiredJsTokens.forEach((token) => {
  assert(js.includes(token), `index.js missing ${token}`)
})

const requiredWxssTokens = [
  "--td-brand-color",
  "lakers-glow",
  "gold-rim",
  "court-hero",
  "copy-strip"
]

requiredWxssTokens.forEach((token) => {
  assert(wxss.includes(token), `index.wxss missing ${token}`)
})

console.log("ui contract ok")
