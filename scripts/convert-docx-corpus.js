const { execFileSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const repoRoot = path.resolve(__dirname, "..")
const defaultInput = "/Users/happytang/Downloads/詹姆斯黑粉反驳语料.docx"
const inputPath = process.argv[2] || defaultInput
const outputCardsPath = path.join(repoRoot, "miniprogram/data/rebuttal_cards_docx.js")
const outputAliasesPath = path.join(repoRoot, "miniprogram/data/aliases_docx.js")

const existingAliases = require("../miniprogram/data/aliases")
const { normalizeQuery } = require("../miniprogram/utils/normalizeQuery")

const genericAliasDenylist = new Set([
  "背打",
  "小牛",
  "耻辱",
  "不纯",
  "救命",
  "四冠",
  "4冠",
  "胜率",
  "没用",
  "单核",
  "打爆",
  "换队",
  "母队",
  "感情",
  "背叛",
  "工龄",
  "刷分",
  "放投",
  "防守",
  "目送",
  "上篮",
  "划水",
  "偷懒",
  "交易",
  "赢球",
  "五冠",
  "前十",
  "带队",
  "goat",
  "历史第二"
])

const publicTermReplacements = [
  [/六步郎/g, "走步争议"],
  [/软脚虾/g, "关键时刻偏软争议"],
  [/软蛋/g, "关键时刻偏软争议"],
  [/摊皇/g, "摊手争议"],
  [/水冠/g, "冠军含金量争议"],
  [/米奇冠军/g, "园区冠军争议"],
  [/报团詹/g, "抱团争议"],
  [/游牧詹/g, "多次换队争议"],
  [/甩锅詹/g, "关键球传球争议"],
  [/叉腰詹/g, "防守态度争议"],
  [/目送詹/g, "防守态度争议"],
  [/Excel詹/g, "数据价值争议"],
  [/错峰詹/g, "出场时间选择争议"],
  [/垃圾时间詹/g, "垃圾时间得分争议"],
  [/端尿盆/g, "投篮姿势争议"]
]

const toneReplacements = [
  [/你怕不是脑子坏了[？?]?/g, "这个说法缺少事实和逻辑支撑。"],
  [/你怕不是只看了[^，。！？!?]*[？?]?/g, "这种说法属于只看片段，不看完整背景。"],
  [/你怕不是/g, "这个观点可能"],
  [/关你屁事/g, "这和篮球评价标准无关"],
  [/我就笑了[，,]?/g, ""],
  [/兄弟们[，,]?/g, ""],
  [/这种话你自己信吗[？?]?/g, "这种说法需要证据支持。"],
  [/这不是黑[^，。！？!?]*[，。！？!?]?/g, "这属于选择性取样。"],
  [/这不是双标是什么[？?]?/g, "这就是同标准对比下的问题。"],
  [/你看过整场比赛吗[？?]?/g, "需要看完整比赛背景。"],
  [/你看过[^？?]*[？?]?/g, "需要看完整比赛背景。"],
  [/你这/g, "这个"],
  [/瞎啊/g, "不严谨"],
  [/你懂球/g, "评价标准不清"],
  [/你比[^，。！？!?]*懂球[？?]?/g, "这种判断需要明确依据。"],
  [/你熬一个我看看/g, "长期稳定产出本身就是能力"],
  [/黑子/g, "反方观点"],
  [/软蛋/g, "关键时刻偏软争议"]
]

const reviewNeededIds = new Set([
  "2011_8_point_veto",
  "2016_irving_three",
  "not_top2"
])

const categoryIdByStyle = [
  [/2011/, "category_2011_finals"],
  [/雷阿伦|2013/, "category_ray_allen_2013"],
  [/2016|格林|欧文/, "category_2016_dispute"],
  [/园区|泡泡|疫情|米奇|缩水/, "category_bubble_ring"],
  [/总决赛|胜率|亚军/, "category_finals_record"],
  [/抱团|换队|跑路|忠诚/, "category_team_switching"],
  [/数据|411|工龄|刷/, "category_stat_padding"],
  [/技术|身体|投篮|背身|中投/, "category_aesthetics"],
  [/走步|六步|端菜/, "category_traveling"],
  [/关键|甩锅|杀手/, "category_clutch"],
  [/防守|叉腰|目送|摊手/, "category_defense_effort"],
  [/LeGM|管理层|交易|透支/, "category_legm"],
  [/乔丹/, "compare_jordan"],
  [/科比/, "compare_kobe"],
  [/库里/, "compare_curry"],
  [/约基奇/, "compare_jokic"],
  [/历史排名|历史地位|前五|前十/, "category_legacy_rank"]
]

function readDocxText(filePath) {
  return execFileSync("textutil", ["-convert", "txt", "-stdout", filePath], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  })
}

function extractJsonArray(text) {
  const start = text.indexOf("[")
  const end = text.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("未找到 JSON 数组")
  }
  return text
    .slice(start, end + 1)
    .replace(/\u2028|\u2029/g, "\n")
    .replace(/\u00a0/g, " ")
}

function applyReplacements(text, replacements) {
  return replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
}

function cleanPublicText(text) {
  if (!text) return ""
  return applyReplacements(String(text).trim(), publicTermReplacements)
    .replace(/\s+/g, " ")
    .trim()
}

function softenTone(text) {
  if (!text) return ""
  return applyReplacements(cleanPublicText(text), toneReplacements)
    .replace(/\s+/g, " ")
    .replace(/！！+/g, "。")
    .replace(/！！/g, "。")
    .trim()
}

function unique(items) {
  const seen = new Set()
  return items.filter((item) => {
    const value = String(item || "").trim()
    if (!value || seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function categoryIdFor(record) {
  const text = `${record.claim_style || ""} ${record.black_claim || ""}`
  const match = categoryIdByStyle.find(([pattern]) => pattern.test(text))
  return match ? match[1] : "category_legacy_rank"
}

function makeSafeId(id) {
  return `docx_${String(id || "item")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")}`
}

function hasRiskyTone(card) {
  const text = [card.short_reply, card.long_reply, card.one_liner, card.video_script].join(" ")
  return /脑子坏|关你屁事|你懂球|你熬一个|瞎啊|黑子|软蛋|我就笑了/.test(text)
}

function recordRiskNotes(record, card) {
  const notes = []
  if (!record.source_note || /需核对/.test(record.source_note)) notes.push("source_needs_review")
  if (reviewNeededIds.has(record.id)) notes.push("fact_claim_needs_review")
  if (hasRiskyTone(card)) notes.push("tone_needs_review")
  return notes
}

function toCard(record) {
  const id = makeSafeId(record.id)
  const comparison = unique([record.double_standard, record.same_standard_comparison, record.rebuttal_angle])
    .map(cleanPublicText)
    .filter(Boolean)
    .join(" ")

  return {
    id,
    category: cleanPublicText(record.claim_style || record.parent_category || "语料库补充"),
    claim: `常见观点：${cleanPublicText(record.black_claim || "")}`,
    valid_part: cleanPublicText(record.valid_part || "该观点包含可讨论的篮球争议。"),
    logic_flaw: cleanPublicText(record.logic_flaw || record.attack_logic || "该观点需要回到完整事实和统一标准判断。"),
    comparison: comparison || "需要同标准比较其他历史级球星的失败、队友资源和时代环境。",
    facts: [],
    short_reply: softenTone(record.reply_short || record.rebuttal_angle || ""),
    long_reply: softenTone(record.reply_logic || record.rebuttal_angle || record.reply_short || ""),
    one_liner: softenTone(record.one_liner || record.reply_short || ""),
    video_script: softenTone(record.video_script || record.reply_logic || ""),
    tags: unique([])
      .concat(record.short_keywords || [])
      .concat(record.aliases || [])
      .concat(record.claim_style ? [record.claim_style] : [])
      .map(cleanPublicText)
      .filter(Boolean)
      .slice(0, 12),
    source_note: record.source_note || "来源需核对",
    risk_note: record.risk_note || "来源需核对，未作为硬事实展示",
    corpus_source: "docx",
    original_id: record.id || ""
  }
}

function isUsefulAlias(alias) {
  const normalized = normalizeQuery(alias)
  if (!normalized || normalized.length < 3) return false
  if (genericAliasDenylist.has(normalized)) return false
  if (genericAliasDenylist.has(alias)) return false
  return true
}

function priorityForAlias(alias) {
  const normalized = normalizeQuery(alias)
  if (/8分释兵权|演韦德|四水冠|错峰詹|叉腰詹|目送詹|甩锅詹|抱团鼻祖/.test(normalized)) return 104
  if (/水冠|缩水冠军|4胜6负|总亚军耻辱|工龄奖|excel詹|端尿盆|没中投/.test(normalized)) return 98
  if (/不如乔丹|不如库里|不如约基奇/.test(normalized)) return 94
  return 88
}

function aliasesForRecord(record, card, existingNormalizedAliases) {
  const rawAliases = unique([])
    .concat(record.aliases || [])
    .concat(record.short_keywords || [])
    .map((alias) => String(alias || "").replace(/\s+/g, " ").trim())
    .filter(isUsefulAlias)

  const seen = new Set()
  return rawAliases
    .filter((alias) => {
      const normalized = normalizeQuery(alias)
      if (seen.has(normalized) || existingNormalizedAliases.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    .slice(0, 4)
    .map((alias) => ({
      alias,
      categoryId: null,
      targetId: card.id,
      priority: priorityForAlias(alias)
    }))
}

function writeModule(filePath, code) {
  fs.writeFileSync(filePath, `${code}\n`, "utf8")
}

function main() {
  const text = readDocxText(inputPath)
  const rawJson = extractJsonArray(text)
  const records = JSON.parse(rawJson)
  const existingNormalizedAliases = new Set(existingAliases.map((item) => normalizeQuery(item.alias)))

  const approvedCards = []
  const reviewNeeded = []
  const aliases = []

  records.forEach((record) => {
    const card = toCard(record)
    const riskNotes = recordRiskNotes(record, card)
    if (riskNotes.includes("fact_claim_needs_review") || riskNotes.includes("tone_needs_review")) {
      reviewNeeded.push({ ...card, review_status: "review_needed", review_reasons: riskNotes })
      return
    }
    approvedCards.push({ ...card, review_status: "approved", review_reasons: riskNotes })
    aliases.push(...aliasesForRecord(record, card, existingNormalizedAliases))
  })

  const cardModule = [
    "const cards = ",
    JSON.stringify(approvedCards, null, 2),
    "\n\nconst reviewNeeded = ",
    JSON.stringify(reviewNeeded, null, 2),
    "\n\nmodule.exports = cards",
    "\nmodule.exports.reviewNeeded = reviewNeeded",
    `\nmodule.exports.stats = ${JSON.stringify({
      rawCount: records.length,
      approvedCount: approvedCards.length,
      reviewNeededCount: reviewNeeded.length
    }, null, 2)}`
  ].join("")

  const aliasModule = `module.exports = ${JSON.stringify(aliases, null, 2)}`

  writeModule(outputCardsPath, cardModule)
  writeModule(outputAliasesPath, aliasModule)

  console.log(`raw=${records.length} approved=${approvedCards.length} review_needed=${reviewNeeded.length} aliases=${aliases.length}`)
}

main()
