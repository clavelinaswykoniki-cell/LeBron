const { matchQuery } = require("../miniprogram/utils/matchQuery")
const arsenal = require("../miniprogram/data/arsenal")
const categories = require("../miniprogram/data/categories")

const { cards, aliases } = arsenal

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
  "基石冠军",
  "没有得分王",
  "没有助攻王",
  "乔丹6-0",
  "07被横扫",
  "宇宙勇",
  "联盟保送",
  "假摔",
  "历史第二十",
  "奥尼尔统治力",
  "文班未来超詹",
  "乔丹没抢七",
  "乔丹十个得分王",
  "科比一人一城",
  "曼巴精神",
  "库里全票MVP",
  "库里无杜冠军",
  "邓肯低调",
  "邓肯马刺体系",
  "杜兰特单挑",
  "死神杜",
  "约基奇组织",
  "约基奇效率",
  "魔术师比詹姆斯强",
  "伯德比詹姆斯强",
  "贾巴尔比詹姆斯强",
  "8分释兵权",
  "演韦德",
  "输给单核小牛",
  "抱团冠军",
  "跨人禁赛",
  "四水冠",
  "缩水冠军",
  "4胜6负",
  "亚军没用",
  "被勇士横扫",
  "抱团鼻祖",
  "游牧詹",
  "错峰詹",
  "垃圾时间詹",
  "Excel詹",
  "端尿盆",
  "没中投",
  "背身不行",
  "甩锅詹",
  "怕背锅",
  "摊手詹",
  "叉腰詹",
  "目送詹",
  "防守划水",
  "甩锅队友",
  "不如约基奇单核夺冠",
  "未知黑点"
]

console.log(`cards=${cards.length} aliases=${aliases.length} categories=${categories.length}`)

for (const query of queries) {
  const results = matchQuery(query)
  console.log(`${query} => ${results.map((item) => `${item.card.id}:${item.category}`).join(" | ")}`)
}
