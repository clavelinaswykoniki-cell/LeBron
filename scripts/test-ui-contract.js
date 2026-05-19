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

// index.json 必须声明这些组件（哪怕 wxml 暂时没用到）
Object.entries(requiredComponents).forEach(([name, componentPath]) => {
  assert(usingComponents[name] === componentPath, `${name} should map to ${componentPath}`)
})

// 首页 v2.6+ 极简设计：核心元素 = composer 输入 + mood chips + 热梗 + 跳转
// 注：mood 文案 "短刀/封口/长拆/口播" 在 wxml 里是循环渲染，字面值检查放到 js 部分
const requiredWxmlTokens = [
  "composer",           // 主输入区
  "onGenerate",         // 主 CTA 绑定
  "onHotBattleTap",     // 热梗 chip 绑定
  "onMoodTap",          // mood tab 绑定
  "onMenuTap",          // 导航绑定
  "moodTabs",           // mood 循环来源
  "t-button"            // CTA 用 TDesign button
]

requiredWxmlTokens.forEach((token) => {
  assert(wxml.includes(token), `index.wxml missing ${token}`)
})

// 首页 JS 必须保留这些 data 字段和 handler，否则下游页面/路由会炸
const requiredJsTokens = [
  "moodTabs",
  "activeMood",
  "hotBattles",
  "onMoodTap",
  "onGenerate",
  "onRandom",
  "onHotBattleTap",
  "navigateTo",        // 必须走跳转，不再在首页渲染结果
  "/pages/result/result",
  "短刀",                 // mood 文案保留（在 moodTabs 数组里）
  "封口",
  "长拆",
  "口播"
]

requiredJsTokens.forEach((token) => {
  assert(js.includes(token), `index.js missing ${token}`)
})

// 首页样式必须包含品牌色变量 + 极简结构 class
const requiredWxssTokens = [
  "--brand-purple",
  "--brand-gold",
  "composer",
  "mood-chip"
]

requiredWxssTokens.forEach((token) => {
  assert(wxss.includes(token), `index.wxss missing ${token}`)
})

console.log("ui contract ok")
