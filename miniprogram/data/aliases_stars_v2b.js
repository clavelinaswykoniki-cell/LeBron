// F6 球星深度对比反驳卡 v2b 别名 (15 张卡 x 3-4 个别名)
// 用于覆盖用户常见说法

const aliases = [
  // ===== Wembanyama (3 张) =====
  // compare_wembanyama_future_goat
  { alias: "文班亚马未来超詹", categoryId: null, targetId: "compare_wembanyama_future_goat", priority: 96 },
  { alias: "文班超詹姆斯", categoryId: null, targetId: "compare_wembanyama_future_goat", priority: 94 },
  { alias: "文班潜力第一", categoryId: null, targetId: "compare_wembanyama_future_goat", priority: 92 },
  { alias: "文班亚马天花板", categoryId: null, targetId: "compare_wembanyama_future_goat", priority: 90 },

  // compare_wembanyama_defense_better
  { alias: "文班防守超詹", categoryId: null, targetId: "compare_wembanyama_defense_better", priority: 94 },
  { alias: "文班防守历史第一", categoryId: null, targetId: "compare_wembanyama_defense_better", priority: 92 },
  { alias: "文班护框天赋", categoryId: null, targetId: "compare_wembanyama_defense_better", priority: 92 },
  { alias: "文班DPOY", categoryId: null, targetId: "compare_wembanyama_defense_better", priority: 90 },

  // compare_wembanyama_vs_young_lebron
  { alias: "文班21岁影响力", categoryId: null, targetId: "compare_wembanyama_vs_young_lebron", priority: 94 },
  { alias: "文班比早期詹强", categoryId: null, targetId: "compare_wembanyama_vs_young_lebron", priority: 92 },
  { alias: "文班同龄超詹", categoryId: null, targetId: "compare_wembanyama_vs_young_lebron", priority: 90 },
  { alias: "21岁文班亚马", categoryId: null, targetId: "compare_wembanyama_vs_young_lebron", priority: 88 },

  // ===== Tatum (3 张) =====
  // compare_tatum_2024_championship_value
  { alias: "塔图姆24冠含金量", categoryId: null, targetId: "compare_tatum_2024_championship_value", priority: 96 },
  { alias: "塔图姆冠军比詹强", categoryId: null, targetId: "compare_tatum_2024_championship_value", priority: 94 },
  { alias: "凯尔特人64胜冠军", categoryId: null, targetId: "compare_tatum_2024_championship_value", priority: 92 },
  { alias: "塔图姆2024总冠军", categoryId: null, targetId: "compare_tatum_2024_championship_value", priority: 90 },

  // compare_tatum_celtics_system
  { alias: "塔图姆有豪华阵容", categoryId: null, targetId: "compare_tatum_celtics_system", priority: 94 },
  { alias: "凯尔特人体系豪华", categoryId: null, targetId: "compare_tatum_celtics_system", priority: 92 },
  { alias: "塔图姆靠队友", categoryId: null, targetId: "compare_tatum_celtics_system", priority: 92 },
  { alias: "詹姆斯没塔图姆阵容", categoryId: null, targetId: "compare_tatum_celtics_system", priority: 90 },

  // compare_tatum_offensive_efficiency
  { alias: "塔图姆进攻效率高", categoryId: null, targetId: "compare_tatum_offensive_efficiency", priority: 94 },
  { alias: "塔图姆得分手更强", categoryId: null, targetId: "compare_tatum_offensive_efficiency", priority: 92 },
  { alias: "塔图姆TS%超詹", categoryId: null, targetId: "compare_tatum_offensive_efficiency", priority: 90 },
  { alias: "塔图姆比詹会得分", categoryId: null, targetId: "compare_tatum_offensive_efficiency", priority: 88 },

  // ===== Embiid (3 张) =====
  // compare_embiid_injury_history
  { alias: "恩比德健康时超詹", categoryId: null, targetId: "compare_embiid_injury_history", priority: 96 },
  { alias: "恩比德伤病不是问题", categoryId: null, targetId: "compare_embiid_injury_history", priority: 94 },
  { alias: "恩比德健康就行", categoryId: null, targetId: "compare_embiid_injury_history", priority: 92 },
  { alias: "恩比德出勤率", categoryId: null, targetId: "compare_embiid_injury_history", priority: 90 },

  // compare_embiid_playoff_collapse
  { alias: "恩比德MVP含金量高", categoryId: null, targetId: "compare_embiid_playoff_collapse", priority: 94 },
  { alias: "恩比德季后赛不行", categoryId: null, targetId: "compare_embiid_playoff_collapse", priority: 92 },
  { alias: "恩比德常规赛MVP", categoryId: null, targetId: "compare_embiid_playoff_collapse", priority: 92 },
  { alias: "恩比德拉胯", categoryId: null, targetId: "compare_embiid_playoff_collapse", priority: 90 },

  // compare_embiid_mvp_fairness
  { alias: "恩比德23MVP超詹", categoryId: null, targetId: "compare_embiid_mvp_fairness", priority: 94 },
  { alias: "恩比德MVP比詹强", categoryId: null, targetId: "compare_embiid_mvp_fairness", priority: 92 },
  { alias: "恩比德MVP公平", categoryId: null, targetId: "compare_embiid_mvp_fairness", priority: 90 },
  { alias: "23MVP含金量", categoryId: null, targetId: "compare_embiid_mvp_fairness", priority: 88 },

  // ===== Doncic (3 张) =====
  // compare_doncic_mavs_core
  { alias: "东契奇独行侠核心", categoryId: null, targetId: "compare_doncic_mavs_core", priority: 96 },
  { alias: "东契奇领袖力超詹", categoryId: null, targetId: "compare_doncic_mavs_core", priority: 94 },
  { alias: "东契奇绝对核心", categoryId: null, targetId: "compare_doncic_mavs_core", priority: 92 },
  { alias: "东契奇带队能力", categoryId: null, targetId: "compare_doncic_mavs_core", priority: 90 },

  // compare_doncic_2024_finals_sweep
  { alias: "东契奇24总决赛被横扫", categoryId: null, targetId: "compare_doncic_2024_finals_sweep", priority: 94 },
  { alias: "东契奇队友不行", categoryId: null, targetId: "compare_doncic_2024_finals_sweep", priority: 92 },
  { alias: "独行侠总决赛1-4", categoryId: null, targetId: "compare_doncic_2024_finals_sweep", priority: 92 },
  { alias: "东契奇横扫不怪他", categoryId: null, targetId: "compare_doncic_2024_finals_sweep", priority: 90 },

  // compare_doncic_vs_young_lebron
  { alias: "东契奇25岁超詹", categoryId: null, targetId: "compare_doncic_vs_young_lebron", priority: 94 },
  { alias: "东契奇同龄比詹强", categoryId: null, targetId: "compare_doncic_vs_young_lebron", priority: 92 },
  { alias: "东契奇数据全面", categoryId: null, targetId: "compare_doncic_vs_young_lebron", priority: 90 },
  { alias: "25岁东契奇", categoryId: null, targetId: "compare_doncic_vs_young_lebron", priority: 88 },

  // ===== Booker (1 张) =====
  // compare_booker_leadership
  { alias: "布克太阳一哥", categoryId: null, targetId: "compare_booker_leadership", priority: 94 },
  { alias: "布克领袖力强", categoryId: null, targetId: "compare_booker_leadership", priority: 92 },
  { alias: "布克比詹会带队", categoryId: null, targetId: "compare_booker_leadership", priority: 90 },
  { alias: "布克太阳核心", categoryId: null, targetId: "compare_booker_leadership", priority: 88 },

  // ===== Edwards (1 张) =====
  // compare_edwards_vs_early_lebron
  { alias: "爱德华兹比早期詹强", categoryId: null, targetId: "compare_edwards_vs_early_lebron", priority: 94 },
  { alias: "爱德华兹乔丹接班人", categoryId: null, targetId: "compare_edwards_vs_early_lebron", priority: 92 },
  { alias: "森林狼爱德华兹", categoryId: null, targetId: "compare_edwards_vs_early_lebron", priority: 90 },
  { alias: "爱德华兹22岁超詹", categoryId: null, targetId: "compare_edwards_vs_early_lebron", priority: 88 },

  // ===== Mitchell (1 张) =====
  // compare_mitchell_vs_cavs_lebron
  { alias: "米切尔骑士新核心", categoryId: null, targetId: "compare_mitchell_vs_cavs_lebron", priority: 94 },
  { alias: "米切尔超詹骑士", categoryId: null, targetId: "compare_mitchell_vs_cavs_lebron", priority: 92 },
  { alias: "米切尔比詹骑士强", categoryId: null, targetId: "compare_mitchell_vs_cavs_lebron", priority: 90 },
  { alias: "骑士1.0 vs 米切尔", categoryId: null, targetId: "compare_mitchell_vs_cavs_lebron", priority: 88 }
]

module.exports = aliases
