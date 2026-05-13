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
  "废队友",
  "老张跑路",
  "甩锅",
  "六步郎",
  "布朗尼靠爹",
  "库里改变篮球",
  "东部红利",
  "LeGM",
  "不会投篮",
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

const shortMemeCases = [
  { query: "8分", targetId: "black_2011_8_points" },
  { query: "八分释兵权", targetId: "black_2011_8_points" },
  { query: "巴里亚", targetId: "black_barea_2011" },
  { query: "演韦德", targetId: "docx_2011_wade_fmvp_sabotage" },
  { query: "韦德FMVP", targetId: "docx_2011_wade_fmvp_sabotage" },
  { query: "输给单核小牛", targetId: "docx_2011_mavs_loss_shame" },
  { query: "4冠6亚", targetId: "black_4_6_finals" },
  { query: "4胜6负", targetId: "docx_finals_10_4_win_rate" },
  { query: "亚军没用", targetId: "docx_runner_up_not_honor" },
  { query: "07被横扫", targetId: "black_2007_swept" },
  { query: "被勇士横扫", targetId: "docx_2018_swept_by_warriors" },
  { query: "抱团冠军", targetId: "docx_2012_big_three_title" },
  { query: "雷阿伦救命", targetId: "black_ray_allen_saved" },
  { query: "欧文救命", targetId: "black_kyrie_saved" },
  { query: "格林禁赛", targetId: "black_draymond_suspension" },
  { query: "米奇冠军", targetId: "black_bubble_ring" },
  { query: "园区冠军", targetId: "black_bubble_ring" },
  { query: "四水冠", targetId: "docx_four_titles_all_water" },
  { query: "缩水冠军", targetId: "docx_2012_lockout_title" },
  { query: "抱团鼻祖", targetId: "docx_created_superteam" },
  { query: "跑路詹", targetId: "docx_run_when_lose" },
  { query: "游牧詹", targetId: "docx_no_one_city" },
  { query: "一人三城", targetId: "black_three_teams" },
  { query: "废队友", targetId: "black_legm" },
  { query: "错峰詹", targetId: "docx_staggered_minutes_brush" },
  { query: "垃圾时间詹", targetId: "docx_garbage_time_brush" },
  { query: "Excel詹", targetId: "docx_excel_king" },
  { query: "411工程", targetId: "black_411_project" },
  { query: "工龄奖", targetId: "docx_411_work_years" },
  { query: "甩锅詹", targetId: "docx_last_pass_scapegoat" },
  { query: "靠身体", targetId: "black_no_skill" },
  { query: "身体流", targetId: "docx_only_body_no_skill" },
  { query: "没技术", targetId: "black_no_skill" },
  { query: "技术糙", targetId: "black_no_skill" },
  { query: "技术粗糙", targetId: "black_no_skill" },
  { query: "不会投篮", targetId: "black_no_skill" },
  { query: "投篮不行", targetId: "black_no_skill" },
  { query: "投篮丑", targetId: "docx_ugly_shooting" },
  { query: "投篮姿势丑", targetId: "docx_ugly_shooting" },
  { query: "端尿盆", targetId: "docx_ugly_shooting" },
  { query: "没中投", targetId: "docx_no_mid_range" },
  { query: "不会中投", targetId: "docx_no_mid_range" },
  { query: "只会突破", targetId: "docx_no_mid_range" },
  { query: "放他投", targetId: "docx_no_mid_range" },
  { query: "脚步差", targetId: "black_no_skill" },
  { query: "没脚步", targetId: "black_no_skill" },
  { query: "背身不行", targetId: "docx_bad_post_move" },
  { query: "突破走步", targetId: "black_traveling" },
  { query: "启动走步", targetId: "black_traveling" },
  { query: "螃蟹步", targetId: "black_traveling" }
]

if (shortMemeCases.length !== 50) {
  throw new Error(`shortMemeCases expected 50, got ${shortMemeCases.length}`)
}

console.log(`cards=${cards.length} aliases=${aliases.length} categories=${categories.length}`)

for (const query of queries) {
  const results = matchQuery(query)
  console.log(`${query} => ${results.map((item) => `${item.card.id}:${item.category}`).join(" | ")}`)
}

for (const { query, targetId } of shortMemeCases) {
  const results = matchQuery(query)
  const targetIds = results.map((item) => item.card.id)
  if (!targetIds.includes(targetId)) {
    throw new Error(`${query} expected ${targetId}, got ${targetIds.join(" | ")}`)
  }
}

console.log(`short meme matches ok=${shortMemeCases.length}`)
