const { matchQuery } = require("../miniprogram/utils/matchQuery")
const cards = require("../miniprogram/data/rebuttal_cards")
const aliases = require("../miniprogram/data/aliases")
const categories = require("../miniprogram/data/categories")

const queries = [
  "8分",
  "八分",
  "2011",
  "米奇冠军",
  "园区冠军",
  "科比五冠",
  "摊皇不回防",
  "Excel球王",
  "老张跑路",
  "甩锅",
  "六步郎",
  "布朗尼靠爹",
  "库里改变篮球",
  "东部红利",
  "LeGM",
  "詹姆斯抱团还4冠6亚",
  "未知黑点"
]

console.log(`cards=${cards.length} aliases=${aliases.length} categories=${categories.length}`)

for (const query of queries) {
  const results = matchQuery(query)
  console.log(`${query} => ${results.map((item) => `${item.card.id}:${item.category}`).join(" | ")}`)
}
