const categories = require("./categories")

const manualAliases = [
  { alias: "老张8分", categoryId: "category_2011_finals", targetId: "black_2011_8_points", priority: 120 },
  { alias: "2011", categoryId: "category_2011_finals", targetId: "black_2011_8_points", priority: 118 },
  { alias: "11年", categoryId: "category_2011_finals", targetId: "black_2011_8_points", priority: 118 },
  { alias: "8分", categoryId: "category_2011_finals", targetId: "black_2011_8_points", priority: 120 },
  { alias: "八分", categoryId: "category_2011_finals", targetId: "black_2011_8_points", priority: 120 },
  { alias: "巴里亚", categoryId: "category_2011_finals", targetId: "black_barea_2011", priority: 110 },
  { alias: "韦德意难平", categoryId: "category_2011_finals", targetId: "black_wade_fmvp_2011", priority: 110 },
  { alias: "4冠6亚", categoryId: "category_finals_record", targetId: "black_4_6_finals", priority: 110 },
  { alias: "总亚军", categoryId: "category_finals_record", targetId: "black_4_6_finals", priority: 100 },
  { alias: "老张跑路", categoryId: "category_team_switching", targetId: "black_team_hopping", priority: 110 },
  { alias: "抱团", categoryId: "category_team_switching", targetId: "black_team_hopping", priority: 108 },
  { alias: "跑路", categoryId: "category_team_switching", targetId: "black_team_hopping", priority: 100 },
  { alias: "南海岸", categoryId: "category_team_switching", targetId: "black_team_hopping", priority: 96 },
  { alias: "一人三城", categoryId: "category_team_switching", targetId: "black_three_teams", priority: 96 },
  { alias: "雷阿伦救命", categoryId: "category_ray_allen_2013", targetId: "black_ray_allen_saved", priority: 108 },
  { alias: "欧文救命", categoryId: "category_2016_dispute", targetId: "black_kyrie_saved", priority: 106 },
  { alias: "格林禁赛", categoryId: "category_2016_dispute", targetId: "black_draymond_suspension", priority: 106 },
  { alias: "Excel球王", categoryId: "category_stat_padding", targetId: "black_stat_padding", priority: 110 },
  { alias: "摊皇Excel", categoryId: "category_stat_padding", targetId: "black_stat_padding", priority: 112 },
  { alias: "411", categoryId: "category_stat_padding", targetId: "black_411_project", priority: 105 },
  { alias: "铁血两分", categoryId: "category_stat_padding", targetId: "black_garbage_points", priority: 98 },
  { alias: "靠身体", categoryId: "category_aesthetics", targetId: "black_no_skill", priority: 100 },
  { alias: "没技术", categoryId: "category_aesthetics", targetId: "black_no_skill", priority: 100 },
  { alias: "六步郎", categoryId: "category_traveling", targetId: "black_traveling", priority: 110 },
  { alias: "六步", categoryId: "category_traveling", targetId: "black_traveling", priority: 100 },
  { alias: "走步", categoryId: "category_traveling", targetId: "black_traveling", priority: 100 },
  { alias: "甩锅", categoryId: "category_clutch", targetId: "black_pass_clutch", priority: 105 },
  { alias: "不敢投", categoryId: "category_clutch", targetId: "black_pass_clutch", priority: 100 },
  { alias: "摊皇不回防", categoryId: "category_defense_effort", targetId: "black_no_defense", priority: 110 },
  { alias: "不回防", categoryId: "category_defense_effort", targetId: "black_no_defense", priority: 100 },
  { alias: "摊手", categoryId: "category_defense_effort", targetId: "black_no_defense", priority: 96 },
  { alias: "东部红利", categoryId: "category_east_path", targetId: "black_east_weak", priority: 108 },
  { alias: "东部福利", categoryId: "category_east_path", targetId: "black_east_weak", priority: 108 },
  { alias: "米奇冠军", categoryId: "category_bubble_ring", targetId: "black_bubble_ring", priority: 112 },
  { alias: "园区冠军", categoryId: "category_bubble_ring", targetId: "black_bubble_ring", priority: 110 },
  { alias: "泡泡冠军", categoryId: "category_bubble_ring", targetId: "black_bubble_ring", priority: 108 },
  { alias: "媒体之子", categoryId: "category_media_marketing", targetId: "black_media_hype", priority: 104 },
  { alias: "Nike亲儿子", categoryId: "category_media_marketing", targetId: "black_media_hype", priority: 104 },
  { alias: "自称GOAT", categoryId: "category_media_marketing", targetId: "black_self_goat", priority: 100 },
  { alias: "布朗尼靠爹", categoryId: "category_bronny", targetId: "black_bronny_nepotism", priority: 110 },
  { alias: "关系户", categoryId: "category_bronny", targetId: "black_bronny_nepotism", priority: 98 },
  { alias: "LeGM", categoryId: "category_legm", targetId: "black_legm", priority: 110 },
  { alias: "legm", categoryId: "category_legm", targetId: "black_legm", priority: 110 },
  { alias: "控制球队", categoryId: "category_legm", targetId: "black_legm", priority: 96 },
  { alias: "科比五冠", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings", priority: 112 },
  { alias: "科比5冠", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings", priority: 112 },
  { alias: "不如科比", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings", priority: 106 },
  { alias: "库里改变篮球", categoryId: "compare_curry", targetId: "compare_curry_changed_game", priority: 112 },
  { alias: "库里击败詹姆斯", categoryId: "compare_curry", targetId: "compare_curry_head_to_head", priority: 108 },
  { alias: "邓肯5冠", categoryId: "compare_duncan", targetId: "compare_duncan_5_rings", priority: 110 },
  { alias: "杜兰特打爆詹姆斯", categoryId: "compare_durant", targetId: "compare_durant_finals", priority: 110 },
  { alias: "约基奇高阶数据", categoryId: "compare_jokic", targetId: "compare_jokic_advanced", priority: 108 }
]

const categoryAliases = categories.flatMap((category) => {
  const keywords = []
    .concat(category.short_keywords || [])
    .concat(category.aliases || [])
    .filter(Boolean)
    .filter((alias) => String(alias).length >= 3)
  return keywords.map((alias) => ({
    alias,
    categoryId: category.id,
    targetId: null,
    priority: Math.max((category.priority || 1) - 20, 1)
  }))
})

module.exports = manualAliases.concat(categoryAliases)
