// F6 球星深度对比反驳卡别名 v2a
// 每张卡 3-4 别名, 用于覆盖用户常见说法
// 对应 rebuttal_cards_stars_v2a.js 的 15 张卡

const aliases = [
  // ===== compare_curry_no_kd_solo_ability (无杜单核能力) =====
  { alias: "库里无杜没单核能力", categoryId: "compare_curry", targetId: "compare_curry_no_kd_solo_ability", priority: 96 },
  { alias: "库里离开杜兰特带不了队", categoryId: "compare_curry", targetId: "compare_curry_no_kd_solo_ability", priority: 94 },
  { alias: "库里单核能力差", categoryId: "compare_curry", targetId: "compare_curry_no_kd_solo_ability", priority: 92 },
  { alias: "库里靠杜兰特拿冠军", categoryId: "compare_curry", targetId: "compare_curry_no_kd_solo_ability", priority: 90 },

  // ===== compare_curry_2016_wcf_g7 (16 西决 G7 输火箭) =====
  { alias: "库里16西决输火箭", categoryId: "compare_curry", targetId: "compare_curry_2016_wcf_g7", priority: 96 },
  { alias: "库里2016西决G7", categoryId: "compare_curry", targetId: "compare_curry_2016_wcf_g7", priority: 94 },
  { alias: "库里关键时刻不行", categoryId: "compare_curry", targetId: "compare_curry_2016_wcf_g7", priority: 92 },
  { alias: "库里大场面失误", categoryId: "compare_curry", targetId: "compare_curry_2016_wcf_g7", priority: 90 },

  // ===== compare_curry_playoff_winrate (季后赛胜率压詹) =====
  { alias: "库里季后赛胜率高", categoryId: "compare_curry", targetId: "compare_curry_playoff_winrate", priority: 96 },
  { alias: "库里季后赛胜率比詹姆斯高", categoryId: "compare_curry", targetId: "compare_curry_playoff_winrate", priority: 94 },
  { alias: "库里更会打季后赛", categoryId: "compare_curry", targetId: "compare_curry_playoff_winrate", priority: 92 },
  { alias: "库里季后赛数据更好", categoryId: "compare_curry", targetId: "compare_curry_playoff_winrate", priority: 90 },

  // ===== compare_curry_3pt_record_all_around (三分纪录压全能) =====
  { alias: "库里三分历史第一", categoryId: "compare_curry", targetId: "compare_curry_3pt_record_all_around", priority: 96 },
  { alias: "库里全能压詹", categoryId: "compare_curry", targetId: "compare_curry_3pt_record_all_around", priority: 94 },
  { alias: "库里三分纪录最强", categoryId: "compare_curry", targetId: "compare_curry_3pt_record_all_around", priority: 92 },
  { alias: "库里投射历史第一", categoryId: "compare_curry", targetId: "compare_curry_3pt_record_all_around", priority: 90 },

  // ===== compare_durant_warriors_join (17/18 抱团) =====
  { alias: "杜兰特抱团勇士", categoryId: "compare_durant", targetId: "compare_durant_warriors_join", priority: 96 },
  { alias: "杜兰特2016加盟勇士", categoryId: "compare_durant", targetId: "compare_durant_warriors_join", priority: 94 },
  { alias: "杜兰特冠军没含金量", categoryId: "compare_durant", targetId: "compare_durant_warriors_join", priority: 92 },
  { alias: "杜兰特17 18抱团冠军", categoryId: "compare_durant", targetId: "compare_durant_warriors_join", priority: 90 },

  // ===== compare_durant_iso_goat (单挑历史地位) =====
  { alias: "杜兰特单挑历史第一", categoryId: "compare_durant", targetId: "compare_durant_iso_goat", priority: 96 },
  { alias: "杜兰特单打最强", categoryId: "compare_durant", targetId: "compare_durant_iso_goat", priority: 94 },
  { alias: "杜兰特ISO历史地位高", categoryId: "compare_durant", targetId: "compare_durant_iso_goat", priority: 92 },
  { alias: "杜兰特一对一比詹强", categoryId: "compare_durant", targetId: "compare_durant_iso_goat", priority: 90 },

  // ===== compare_durant_rockets_stepback (终结火箭后退三分) =====
  { alias: "杜兰特后退三分", categoryId: "compare_durant", targetId: "compare_durant_rockets_stepback", priority: 96 },
  { alias: "杜兰特2018西决终结火箭", categoryId: "compare_durant", targetId: "compare_durant_rockets_stepback", priority: 94 },
  { alias: "杜兰特关键球比詹强", categoryId: "compare_durant", targetId: "compare_durant_rockets_stepback", priority: 92 },
  { alias: "杜兰特G7终结火箭", categoryId: "compare_durant", targetId: "compare_durant_rockets_stepback", priority: 90 },

  // ===== compare_durant_achilles_return (跟腱伤复出) =====
  { alias: "杜兰特跟腱断裂复出", categoryId: "compare_durant", targetId: "compare_durant_achilles_return", priority: 96 },
  { alias: "杜兰特意志力比詹强", categoryId: "compare_durant", targetId: "compare_durant_achilles_return", priority: 94 },
  { alias: "杜兰特大伤复出顶级", categoryId: "compare_durant", targetId: "compare_durant_achilles_return", priority: 92 },
  { alias: "杜兰特跟腱伤复出", categoryId: "compare_durant", targetId: "compare_durant_achilles_return", priority: 90 },

  // ===== compare_jokic_solo_2_titles (单核两冠 vs 詹 1 单核) =====
  { alias: "约基奇单核两冠", categoryId: "compare_jokic", targetId: "compare_jokic_solo_2_titles", priority: 96 },
  { alias: "约基奇单核比詹强", categoryId: "compare_jokic", targetId: "compare_jokic_solo_2_titles", priority: 94 },
  { alias: "约基奇单核冠军多", categoryId: "compare_jokic", targetId: "compare_jokic_solo_2_titles", priority: 92 },
  { alias: "詹姆斯单核冠军只有1个", categoryId: "compare_jokic", targetId: "compare_jokic_solo_2_titles", priority: 90 },

  // ===== compare_jokic_international_player (国际球员对比) =====
  { alias: "约基奇国际球员MVP冠军", categoryId: "compare_jokic", targetId: "compare_jokic_international_player", priority: 96 },
  { alias: "约基奇国际球员比詹强", categoryId: "compare_jokic", targetId: "compare_jokic_international_player", priority: 94 },
  { alias: "约基奇塞尔维亚之光", categoryId: "compare_jokic", targetId: "compare_jokic_international_player", priority: 92 },
  { alias: "国际球员压詹姆斯", categoryId: "compare_jokic", targetId: "compare_jokic_international_player", priority: 90 },

  // ===== compare_jokic_efficiency_data (数据效率) =====
  { alias: "约基奇效率历史前三", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_data", priority: 96 },
  { alias: "约基奇数据效率最高", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_data", priority: 94 },
  { alias: "约基奇PER历史顶级", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_data", priority: 92 },
  { alias: "约基奇高阶数据压詹", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_data", priority: 90 },

  // ===== compare_jokic_defense_gap (防守差距) =====
  { alias: "约基奇防守不差", categoryId: "compare_jokic", targetId: "compare_jokic_defense_gap", priority: 96 },
  { alias: "约基奇综合实力压詹", categoryId: "compare_jokic", targetId: "compare_jokic_defense_gap", priority: 94 },
  { alias: "约基奇防守比詹强", categoryId: "compare_jokic", targetId: "compare_jokic_defense_gap", priority: 92 },
  { alias: "约基奇综合实力强", categoryId: "compare_jokic", targetId: "compare_jokic_defense_gap", priority: 90 },

  // ===== compare_giannis_solo_2021 (21 单核冠军) =====
  { alias: "字母哥单核夺冠", categoryId: "compare_giannis", targetId: "compare_giannis_solo_2021", priority: 96 },
  { alias: "字母哥2021单核", categoryId: "compare_giannis", targetId: "compare_giannis_solo_2021", priority: 94 },
  { alias: "字母哥单核能力比詹强", categoryId: "compare_giannis", targetId: "compare_giannis_solo_2021", priority: 92 },
  { alias: "字母哥G6砍50分", categoryId: "compare_giannis", targetId: "compare_giannis_solo_2021", priority: 90 },

  // ===== compare_giannis_free_throw_weakness (罚球短板) =====
  { alias: "字母哥罚球差", categoryId: "compare_giannis", targetId: "compare_giannis_free_throw_weakness", priority: 96 },
  { alias: "字母哥罚球比詹强", categoryId: "compare_giannis", targetId: "compare_giannis_free_throw_weakness", priority: 94 },
  { alias: "字母哥关键时刻罚球", categoryId: "compare_giannis", targetId: "compare_giannis_free_throw_weakness", priority: 92 },
  { alias: "Hack-a-Giannis", categoryId: "compare_giannis", targetId: "compare_giannis_free_throw_weakness", priority: 90 },

  // ===== compare_giannis_physical_style (身体流对比) =====
  { alias: "字母哥身体流碾压", categoryId: "compare_giannis", targetId: "compare_giannis_physical_style", priority: 96 },
  { alias: "字母哥新时代标杆", categoryId: "compare_giannis", targetId: "compare_giannis_physical_style", priority: 94 },
  { alias: "字母哥身体流比詹强", categoryId: "compare_giannis", targetId: "compare_giannis_physical_style", priority: 92 },
  { alias: "字母哥身体素质碾压", categoryId: "compare_giannis", targetId: "compare_giannis_physical_style", priority: 90 }
]

module.exports = aliases
