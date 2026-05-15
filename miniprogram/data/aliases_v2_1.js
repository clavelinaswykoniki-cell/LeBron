// F5 v2.1 新增 5 张卡对应别名表
// 采用任务约定的 v2.1 结构：{ term, card_ids, priority }
// 主 Claude 后续集成时按需映射为 aliases.js 的 { alias, categoryId, targetId, priority } 结构

const aliases = [
  // ===== 1. 泡泡冠军 =====
  { term: "泡泡冠军", card_ids: ["black_bubble_ring_2020"], priority: 1 },
  { term: "园区冠军", card_ids: ["black_bubble_ring_2020"], priority: 1 },
  { term: "迪斯尼冠军", card_ids: ["black_bubble_ring_2020"], priority: 2 },
  { term: "2020 冠军水", card_ids: ["black_bubble_ring_2020"], priority: 2 },
  { term: "泡泡赛", card_ids: ["black_bubble_ring_2020"], priority: 2 },
  { term: "奥兰多冠军", card_ids: ["black_bubble_ring_2020"], priority: 2 },

  // ===== 2. 21 年后湖人崩盘 =====
  { term: "21后湖人", card_ids: ["black_lakers_collapse_2021_plus"], priority: 1 },
  { term: "21年后", card_ids: ["black_lakers_collapse_2021_plus"], priority: 1 },
  { term: "湖人崩盘", card_ids: ["black_lakers_collapse_2021_plus"], priority: 1 },
  { term: "掘金横扫", card_ids: ["black_lakers_collapse_2021_plus"], priority: 2 },
  { term: "23西决", card_ids: ["black_lakers_collapse_2021_plus"], priority: 2 },
  { term: "詹姆斯衰退", card_ids: ["black_lakers_collapse_2021_plus"], priority: 2 },
  { term: "威少错配", card_ids: ["black_lakers_collapse_2021_plus"], priority: 3 },

  // ===== 3. 没有招牌动作 =====
  { term: "没有招牌动作", card_ids: ["black_no_signature_move"], priority: 1 },
  { term: "没招牌动作", card_ids: ["black_no_signature_move"], priority: 1 },
  { term: "没招牌", card_ids: ["black_no_signature_move"], priority: 1 },
  { term: "没绝活", card_ids: ["black_no_signature_move"], priority: 2 },
  { term: "标志动作", card_ids: ["black_no_signature_move"], priority: 2 },
  { term: "代表动作", card_ids: ["black_no_signature_move"], priority: 3 },

  // ===== 4. 总决赛胜率 40% =====
  { term: "总决赛胜率", card_ids: ["black_finals_win_rate"], priority: 1 },
  { term: "胜率40", card_ids: ["black_finals_win_rate"], priority: 1 },
  { term: "10进4冠", card_ids: ["black_finals_win_rate"], priority: 1 },
  { term: "十进四冠", card_ids: ["black_finals_win_rate"], priority: 1 },
  { term: "乔丹6-0", card_ids: ["black_finals_win_rate"], priority: 2 },
  { term: "六比零", card_ids: ["black_finals_win_rate"], priority: 2 },
  { term: "胜率论", card_ids: ["black_finals_win_rate"], priority: 2 },

  // ===== 5. G7 表现 / 系列赛 G7 论 =====
  { term: "G7拉胯", card_ids: ["black_game7_performance"], priority: 1 },
  { term: "抢七拉胯", card_ids: ["black_game7_performance"], priority: 1 },
  { term: "G7表现", card_ids: ["black_game7_performance"], priority: 1 },
  { term: "chase-down", card_ids: ["black_game7_performance"], priority: 2 },
  { term: "追身大帽", card_ids: ["black_game7_performance"], priority: 2 },
  { term: "靠欧文", card_ids: ["black_game7_performance"], priority: 2 },
  { term: "16年G7", card_ids: ["black_game7_performance"], priority: 2 }
]

module.exports = aliases
