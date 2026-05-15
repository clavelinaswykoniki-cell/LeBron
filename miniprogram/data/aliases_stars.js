// F6 球星深度对比反驳卡别名 (~80 条)
// 每张卡 3-5 个别名, 用于覆盖用户常见说法

const aliases = [
  // ===== compare_curry_revolution_overrated (改变篮球) =====
  { alias: "库里改变篮球", categoryId: "compare_curry", targetId: "compare_curry_revolution_overrated", priority: 96 },
  { alias: "三分革命", categoryId: "compare_curry", targetId: "compare_curry_revolution_overrated", priority: 94 },
  { alias: "改变现代篮球", categoryId: "compare_curry", targetId: "compare_curry_revolution_overrated", priority: 94 },
  { alias: "库里更伟大", categoryId: "compare_curry", targetId: "compare_curry_revolution_overrated", priority: 92 },
  { alias: "库里影响后辈", categoryId: "compare_curry", targetId: "compare_curry_revolution_overrated", priority: 90 },

  // ===== compare_curry_no_kd_only_1 (无杜 1 冠) =====
  { alias: "库里无杜只有1冠", categoryId: "compare_curry", targetId: "compare_curry_no_kd_only_1", priority: 96 },
  { alias: "库里只有一个冠军", categoryId: "compare_curry", targetId: "compare_curry_no_kd_only_1", priority: 94 },
  { alias: "库里带不动队", categoryId: "compare_curry", targetId: "compare_curry_no_kd_only_1", priority: 94 },
  { alias: "库里没杜没冠军", categoryId: "compare_curry", targetId: "compare_curry_no_kd_only_1", priority: 92 },
  { alias: "库里靠杜兰特", categoryId: "compare_curry", targetId: "compare_curry_no_kd_only_1", priority: 90 },

  // ===== compare_curry_career_finals_record (7进4冠胜率) =====
  { alias: "库里7进总决赛", categoryId: "compare_curry", targetId: "compare_curry_career_finals_record", priority: 94 },
  { alias: "库里胜率比詹姆斯高", categoryId: "compare_curry", targetId: "compare_curry_career_finals_record", priority: 94 },
  { alias: "库里总决赛胜率", categoryId: "compare_curry", targetId: "compare_curry_career_finals_record", priority: 92 },
  { alias: "詹姆斯10进4冠太低", categoryId: "compare_curry", targetId: "compare_curry_career_finals_record", priority: 90 },

  // ===== compare_curry_clutch_better (库里关键球) =====
  { alias: "库里关键球更强", categoryId: "compare_curry", targetId: "compare_curry_clutch_better", priority: 94 },
  { alias: "库里关键时刻", categoryId: "compare_curry", targetId: "compare_curry_clutch_better", priority: 92 },
  { alias: "库里关键投篮", categoryId: "compare_curry", targetId: "compare_curry_clutch_better", priority: 92 },
  { alias: "库里末节比詹强", categoryId: "compare_curry", targetId: "compare_curry_clutch_better", priority: 90 },

  // ===== compare_kd_pure_scorer_better (纯得分手第一) =====
  { alias: "杜兰特纯得分历史第一", categoryId: "compare_durant", targetId: "compare_kd_pure_scorer_better", priority: 96 },
  { alias: "纯得分手第一", categoryId: "compare_durant", targetId: "compare_kd_pure_scorer_better", priority: 94 },
  { alias: "杜兰特得分技术更强", categoryId: "compare_durant", targetId: "compare_kd_pure_scorer_better", priority: 94 },
  { alias: "杜得分手历史最强", categoryId: "compare_durant", targetId: "compare_kd_pure_scorer_better", priority: 92 },

  // ===== compare_kd_chose_warriors (KD 抱团更恶劣) =====
  { alias: "杜兰特抱团更恶劣", categoryId: "compare_durant", targetId: "compare_kd_chose_warriors", priority: 96 },
  { alias: "杜兰特加入勇士", categoryId: "compare_durant", targetId: "compare_kd_chose_warriors", priority: 94 },
  { alias: "KD加入73胜勇士", categoryId: "compare_durant", targetId: "compare_kd_chose_warriors", priority: 94 },
  { alias: "杜兰特73胜抱团", categoryId: "compare_durant", targetId: "compare_kd_chose_warriors", priority: 92 },
  { alias: "杜兰特抱腿", categoryId: "compare_durant", targetId: "compare_kd_chose_warriors", priority: 90 },

  // ===== compare_kd_finals_record (KD 5 进 2 冠胜率) =====
  { alias: "杜兰特5进2冠胜率高", categoryId: "compare_durant", targetId: "compare_kd_finals_record", priority: 94 },
  { alias: "KD总决赛胜率", categoryId: "compare_durant", targetId: "compare_kd_finals_record", priority: 92 },
  { alias: "杜兰特决赛胜率", categoryId: "compare_durant", targetId: "compare_kd_finals_record", priority: 92 },
  { alias: "KD胜率比詹高", categoryId: "compare_durant", targetId: "compare_kd_finals_record", priority: 90 },

  // ===== compare_kd_irrelevant_post_warriors (KD 离开勇士) =====
  { alias: "杜兰特离开勇士", categoryId: "compare_durant", targetId: "compare_kd_irrelevant_post_warriors", priority: 94 },
  { alias: "KD离队后没决赛", categoryId: "compare_durant", targetId: "compare_kd_irrelevant_post_warriors", priority: 92 },
  { alias: "杜兰特靠勇士", categoryId: "compare_durant", targetId: "compare_kd_irrelevant_post_warriors", priority: 92 },
  { alias: "杜兰特篮网失败", categoryId: "compare_durant", targetId: "compare_kd_irrelevant_post_warriors", priority: 90 },

  // ===== compare_jokic_single_core_champion (约基奇单核) =====
  { alias: "约基奇单核夺冠", categoryId: "compare_jokic", targetId: "compare_jokic_single_core_champion", priority: 96 },
  { alias: "约老师单核", categoryId: "compare_jokic", targetId: "compare_jokic_single_core_champion", priority: 94 },
  { alias: "约基奇没队友", categoryId: "compare_jokic", targetId: "compare_jokic_single_core_champion", priority: 92 },
  { alias: "约基奇队友弱", categoryId: "compare_jokic", targetId: "compare_jokic_single_core_champion", priority: 92 },
  { alias: "穆雷不强", categoryId: "compare_jokic", targetId: "compare_jokic_single_core_champion", priority: 88 },

  // ===== compare_jokic_efficiency_better (约基奇效率高) =====
  { alias: "约基奇效率高", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_better", priority: 94 },
  { alias: "约基奇高阶数据", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_better", priority: 92 },
  { alias: "约基奇PER", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_better", priority: 90 },
  { alias: "约基奇BPM", categoryId: "compare_jokic", targetId: "compare_jokic_efficiency_better", priority: 90 },

  // ===== compare_jokic_no_drama (约基奇不闹事) =====
  { alias: "约基奇不闹事", categoryId: "compare_jokic", targetId: "compare_jokic_no_drama", priority: 94 },
  { alias: "LeGM", categoryId: "compare_jokic", targetId: "compare_jokic_no_drama", priority: 94 },
  { alias: "詹姆斯操控球队", categoryId: "compare_jokic", targetId: "compare_jokic_no_drama", priority: 92 },
  { alias: "约基奇纯粹", categoryId: "compare_jokic", targetId: "compare_jokic_no_drama", priority: 90 },

  // ===== compare_giannis_real_single_core (字母真单核) =====
  { alias: "字母哥真单核", categoryId: "compare_giannis", targetId: "compare_giannis_real_single_core", priority: 96 },
  { alias: "字母哥G6 50分", categoryId: "compare_giannis", targetId: "compare_giannis_real_single_core", priority: 94 },
  { alias: "字母哥比詹强", categoryId: "compare_giannis", targetId: "compare_giannis_real_single_core", priority: 92 },
  { alias: "雄鹿单核夺冠", categoryId: "compare_giannis", targetId: "compare_giannis_real_single_core", priority: 92 },

  // ===== compare_giannis_physical_only (字母身体流) =====
  { alias: "字母哥纯身体", categoryId: "compare_giannis", targetId: "compare_giannis_physical_only", priority: 94 },
  { alias: "字母哥靠身体", categoryId: "compare_giannis", targetId: "compare_giannis_physical_only", priority: 94 },
  { alias: "詹姆斯也是身体流", categoryId: "compare_giannis", targetId: "compare_giannis_physical_only", priority: 92 },
  { alias: "字母三分罚球", categoryId: "compare_giannis", targetId: "compare_giannis_physical_only", priority: 90 },

  // ===== compare_giannis_no_signature_move (字母没招牌) =====
  { alias: "字母哥没招牌动作", categoryId: "compare_giannis", targetId: "compare_giannis_no_signature_move", priority: 92 },
  { alias: "詹姆斯没招牌动作", categoryId: "compare_giannis", targetId: "compare_giannis_no_signature_move", priority: 94 },
  { alias: "招牌动作双标", categoryId: "compare_giannis", targetId: "compare_giannis_no_signature_move", priority: 90 },
  { alias: "字母哥也没绝招", categoryId: "compare_giannis", targetId: "compare_giannis_no_signature_move", priority: 88 },

  // ===== compare_wemby_future_better (文班未来超詹) =====
  { alias: "文班未来超詹", categoryId: "compare_wemby", targetId: "compare_wemby_future_better", priority: 96 },
  { alias: "文班亚马必超詹", categoryId: "compare_wemby", targetId: "compare_wemby_future_better", priority: 94 },
  { alias: "文班潜力", categoryId: "compare_wemby", targetId: "compare_wemby_future_better", priority: 92 },
  { alias: "Wemby超詹", categoryId: "compare_wemby", targetId: "compare_wemby_future_better", priority: 90 },

  // ===== compare_wemby_height_unfair (文班 224 太逆天) =====
  { alias: "文班亚马身高", categoryId: "compare_wemby", targetId: "compare_wemby_height_unfair", priority: 92 },
  { alias: "文班224", categoryId: "compare_wemby", targetId: "compare_wemby_height_unfair", priority: 92 },
  { alias: "文班身高逆天", categoryId: "compare_wemby", targetId: "compare_wemby_height_unfair", priority: 90 },
  { alias: "文班天赋无解", categoryId: "compare_wemby", targetId: "compare_wemby_height_unfair", priority: 88 },

  // ===== compare_wemby_better_already (文班数据已经超詹新秀) =====
  { alias: "文班新秀比詹强", categoryId: "compare_wemby", targetId: "compare_wemby_better_already", priority: 94 },
  { alias: "文班数据已经超詹", categoryId: "compare_wemby", targetId: "compare_wemby_better_already", priority: 92 },
  { alias: "文班新秀数据好", categoryId: "compare_wemby", targetId: "compare_wemby_better_already", priority: 92 },
  { alias: "文班起点更高", categoryId: "compare_wemby", targetId: "compare_wemby_better_already", priority: 90 },

  // ===== compare_tatum_2024_champion (塔图姆夺冠超詹) =====
  { alias: "塔图姆24年夺冠", categoryId: "compare_tatum", targetId: "compare_tatum_2024_champion", priority: 94 },
  { alias: "塔图姆26岁1冠", categoryId: "compare_tatum", targetId: "compare_tatum_2024_champion", priority: 92 },
  { alias: "塔图姆未来超詹", categoryId: "compare_tatum", targetId: "compare_tatum_2024_champion", priority: 92 },
  { alias: "凯尔特人夺冠", categoryId: "compare_tatum", targetId: "compare_tatum_2024_champion", priority: 88 },

  // ===== compare_haliburton_clutch (哈利伯顿关键球) =====
  { alias: "哈利伯顿关键球", categoryId: "compare_haliburton", targetId: "compare_haliburton_clutch", priority: 94 },
  { alias: "哈利伯顿绝杀", categoryId: "compare_haliburton", targetId: "compare_haliburton_clutch", priority: 92 },
  { alias: "哈利伯顿比詹强", categoryId: "compare_haliburton", targetId: "compare_haliburton_clutch", priority: 92 },
  { alias: "步行者关键时刻", categoryId: "compare_haliburton", targetId: "compare_haliburton_clutch", priority: 88 },

  // ===== compare_sga_mvp_better (SGA MVP 超詹) =====
  { alias: "SGA已经超詹", categoryId: "compare_sga", targetId: "compare_sga_mvp_better", priority: 94 },
  { alias: "SGA MVP", categoryId: "compare_sga", targetId: "compare_sga_mvp_better", priority: 92 },
  { alias: "亚历山大MVP", categoryId: "compare_sga", targetId: "compare_sga_mvp_better", priority: 92 },
  { alias: "雷霆战绩第一", categoryId: "compare_sga", targetId: "compare_sga_mvp_better", priority: 88 },
  { alias: "SGA比詹强", categoryId: "compare_sga", targetId: "compare_sga_mvp_better", priority: 90 }
]

module.exports = aliases
