// F12 时代对比卡别名表（约 50 条）

const aliases = [
  // Magic
  { alias: "魔术师80年代", categoryId: "compare_magic", targetId: "compare_magic_80s_threepeat", priority: 92 },
  { alias: "Showtime", categoryId: "compare_magic", targetId: "compare_magic_80s_threepeat", priority: 90 },
  { alias: "魔术师三连冠", categoryId: "compare_magic", targetId: "compare_magic_80s_threepeat", priority: 92 },
  { alias: "魔术师5冠", categoryId: "compare_magic", targetId: "compare_magic_80s_threepeat", priority: 90 },
  { alias: "魔术师比詹姆斯强", categoryId: "compare_magic", targetId: "compare_magic_80s_threepeat", priority: 88 },

  // Bird
  { alias: "大鸟纯粹", categoryId: "compare_bird", targetId: "compare_bird_celtics_dynasty", priority: 92 },
  { alias: "伯德3冠", categoryId: "compare_bird", targetId: "compare_bird_celtics_dynasty", priority: 90 },
  { alias: "大鸟3MVP", categoryId: "compare_bird", targetId: "compare_bird_celtics_dynasty", priority: 90 },
  { alias: "凯尔特人复兴", categoryId: "compare_bird", targetId: "compare_bird_celtics_dynasty", priority: 88 },
  { alias: "伯德纯粹", categoryId: "compare_bird", targetId: "compare_bird_celtics_dynasty", priority: 88 },

  // Kareem
  { alias: "贾巴尔得分王", categoryId: "compare_kareem", targetId: "compare_kareem_scoring_king", priority: 94 },
  { alias: "天勾", categoryId: "compare_kareem", targetId: "compare_kareem_scoring_king", priority: 90 },
  { alias: "贾巴尔38387", categoryId: "compare_kareem", targetId: "compare_kareem_scoring_king", priority: 92 },
  { alias: "贾巴尔比詹姆斯强", categoryId: "compare_kareem", targetId: "compare_kareem_scoring_king", priority: 88 },
  { alias: "得分王含金量", categoryId: "compare_kareem", targetId: "compare_kareem_scoring_king", priority: 86 },

  // Wilt
  { alias: "张伯伦100分", categoryId: "compare_wilt", targetId: "compare_wilt_chamberlain_dominance", priority: 94 },
  { alias: "张伯伦50分", categoryId: "compare_wilt", targetId: "compare_wilt_chamberlain_dominance", priority: 92 },
  { alias: "张伯伦统治力", categoryId: "compare_wilt", targetId: "compare_wilt_chamberlain_dominance", priority: 90 },
  { alias: "Wilt", categoryId: "compare_wilt", targetId: "compare_wilt_chamberlain_dominance", priority: 88 },
  { alias: "张伯伦比詹姆斯强", categoryId: "compare_wilt", targetId: "compare_wilt_chamberlain_dominance", priority: 86 },

  // Jordan 6-0
  { alias: "乔丹6-0", categoryId: "compare_jordan", targetId: "compare_jordan_6_0_perfect", priority: 96 },
  { alias: "6进6冠", categoryId: "compare_jordan", targetId: "compare_jordan_6_0_perfect", priority: 94 },
  { alias: "乔丹6FMVP", categoryId: "compare_jordan", targetId: "compare_jordan_6_0_perfect", priority: 92 },
  { alias: "乔丹完美", categoryId: "compare_jordan", targetId: "compare_jordan_6_0_perfect", priority: 90 },
  { alias: "乔丹没输过", categoryId: "compare_jordan", targetId: "compare_jordan_6_0_perfect", priority: 88 },

  // Kobe
  { alias: "科比5冠", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings_solo", priority: 94 },
  { alias: "黑曼巴", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings_solo", priority: 90 },
  { alias: "科比一人一城", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings_solo", priority: 92 },
  { alias: "科比单核", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings_solo", priority: 90 },
  { alias: "科比比詹姆斯强", categoryId: "compare_kobe", targetId: "compare_kobe_5_rings_solo", priority: 88 },

  // Duncan
  { alias: "邓肯一人一城", categoryId: "compare_duncan", targetId: "compare_duncan_one_city_5_rings", priority: 94 },
  { alias: "邓肯5冠", categoryId: "compare_duncan", targetId: "compare_duncan_one_city_5_rings", priority: 92 },
  { alias: "邓肯19年", categoryId: "compare_duncan", targetId: "compare_duncan_one_city_5_rings", priority: 90 },
  { alias: "GDP铁三角", categoryId: "compare_duncan", targetId: "compare_duncan_one_city_5_rings", priority: 88 },
  { alias: "石佛", categoryId: "compare_duncan", targetId: "compare_duncan_one_city_5_rings", priority: 86 },

  // Hakeem
  { alias: "奥拉朱旺单核", categoryId: "compare_hakeem", targetId: "compare_hakeem_94_95_solo", priority: 92 },
  { alias: "大梦94", categoryId: "compare_hakeem", targetId: "compare_hakeem_94_95_solo", priority: 90 },
  { alias: "奥拉朱旺两连冠", categoryId: "compare_hakeem", targetId: "compare_hakeem_94_95_solo", priority: 90 },
  { alias: "94/95火箭", categoryId: "compare_hakeem", targetId: "compare_hakeem_94_95_solo", priority: 88 },
  { alias: "大梦脚步", categoryId: "compare_hakeem", targetId: "compare_hakeem_94_95_solo", priority: 86 },

  // Russell
  { alias: "罗素11冠", categoryId: "compare_russell", targetId: "compare_russell_11_rings_dynasty", priority: 94 },
  { alias: "比尔罗素", categoryId: "compare_russell", targetId: "compare_russell_11_rings_dynasty", priority: 92 },
  { alias: "8连冠", categoryId: "compare_russell", targetId: "compare_russell_11_rings_dynasty", priority: 90 },
  { alias: "凯尔特人王朝", categoryId: "compare_russell", targetId: "compare_russell_11_rings_dynasty", priority: 88 },
  { alias: "罗素纪录", categoryId: "compare_russell", targetId: "compare_russell_11_rings_dynasty", priority: 86 },

  // 80/90 era
  { alias: "硬汉时代", categoryId: "compare_era", targetId: "compare_80s_90s_hardman_era", priority: 92 },
  { alias: "现代规则", categoryId: "compare_era", targetId: "compare_80s_90s_hardman_era", priority: 90 },
  { alias: "防守3秒", categoryId: "compare_era", targetId: "compare_80s_90s_hardman_era", priority: 88 },
  { alias: "规则保护", categoryId: "compare_era", targetId: "compare_80s_90s_hardman_era", priority: 88 },
  { alias: "手检时代", categoryId: "compare_era", targetId: "compare_80s_90s_hardman_era", priority: 86 },
  { alias: "时代对比", categoryId: "compare_era", targetId: "compare_80s_90s_hardman_era", priority: 84 }
]

module.exports = aliases
