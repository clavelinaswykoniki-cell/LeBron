// v2.5 高优先 30 张 black_/compare_ 卡的扩展 JSON
// 字段：events / data / causes / background / analysis
// 全部内嵌引用用中文「」避免 JS 双引号 syntax error

const extendedById = {
  "black_2011_8_points": {
    events: [
      { year: 2011, title: "热火三巨头第一年", summary: "詹姆斯 26 岁加盟韦德波什第一年磨合" },
      { year: 2011, title: "总决赛 G4 8 分", summary: "詹姆斯 11 投 3 中得 8 分，第四节 0 分" },
      { year: 2011, title: "1-3 输给小牛", summary: "热火被诺维茨基 + 巴里亚翻盘" }
    ],
    data: [
      { label: "G4 出手次数", value: "11 投 3 中", source: "NBA 官方数据" },
      { label: "全系列场均", value: "17.8 分 7.8 板 7.2 助", source: "NBA 官方数据" },
      { label: "对位巴里亚身高", value: "1.83 米（错位严重）", source: "NBA 球员资料" }
    ],
    causes: [
      "热火三巨头第一年球权分配混乱—战术上让韦德主导持球，詹姆斯被空切而不是持球 ISO，他的「突破压缩防线+传球创造」价值断崖式下降。",
      "持球大核被错位成无球是阵容错配不是个人软弱（用户深度论点种子）。"
    ],
    background: "2011 年总决赛是热火三巨头组建第一年。当时韦德是热火功勋核心，球权优先给他，詹姆斯被迫做无球。但詹姆斯打法本质是「持球大核」，无球大幅削弱他威胁。",
    analysis: "把 G4 单场 8 分定性为「软」忽略了战术错配 + 第一年磨合。同标准看：科比 04 总决赛单场 11 分、乔丹 95 复出首轮被横扫，没人因此说他们软。8 分释兵权应该是热火管理层 + 教练组失误，不是詹姆斯个人耻辱。"
  },
  "black_barea_2011": {
    events: [
      { year: 2011, title: "巴里亚 G4 先发", summary: "卡莱尔启用 1.83 米控卫专攻热火错位" },
      { year: 2011, title: "詹姆斯无法换防", summary: "整轮被错位刺穿，热火换防体系崩盘" }
    ],
    data: [
      { label: "巴里亚身高", value: "1.83 米", source: "NBA 球员资料" },
      { label: "巴里亚总决赛场均", value: "9.5 分 3 助", source: "Basketball Reference" },
      { label: "热火换防漏洞", value: "G4-G6 持续被针对", source: "比赛复盘" }
    ],
    causes: [
      "热火三巨头习惯单防顶级球员，对小个突破型控卫缺乏轮换预案。巴里亚反复利用错位刺穿防线。",
      "詹姆斯当时还未练出防小后卫的脚步频率，遇挡拆容易被绕过或换给波什。"
    ],
    background: "卡莱尔在 G4 改首发巴里亚是教练级 micro-adjustment 经典案例—专门攻击热火的换防漏洞，成为系列赛转折点。",
    analysis: "热火被巴里亚刺穿是教练博弈层面的问题（斯波 vs 卡莱尔），不是詹姆斯个人防守差。同时期任何球员遇到这种错位都会困难。"
  },
  "black_wade_fmvp_2011": {
    events: [
      { year: 2011, title: "韦德三大首席", summary: "热火管理层和战术倾向给韦德 FMVP 路径" },
      { year: 2011, title: "詹姆斯让球权", summary: "战术上让韦德主导关键球，自己做无球" }
    ],
    data: [
      { label: "韦德 2011 总决赛场均", value: "26.5 分", source: "NBA 官方数据" },
      { label: "詹姆斯 2011 总决赛场均", value: "17.8 分", source: "NBA 官方数据" },
      { label: "热火管理层意图", value: "FMVP 目标分给韦德（公开报道）", source: "ESPN 报道" }
    ],
    causes: [
      "韦德是热火建队功勋，第一年三巨头他是球队领袖，球权优先合理。",
      "詹姆斯让出球权本质是「为团队牺牲」，结果被解读成「打不动」。"
    ],
    background: "2010 决定一后詹姆斯主动选择加盟，热火管理层有义务保护韦德的核心地位。这是劳资关系不是个人选择。",
    analysis: "韦德 FMVP 意难平是热火第一年体制问题。詹姆斯当时还在适应「让出球权」的角色，第二年（2012）就重新拿回主导拿 FMVP。"
  },
  "black_4_6_finals": {
    events: [
      { year: 2011, title: "首次 1-3 翻盘失败", summary: "热火被小牛 4-2 翻盘" },
      { year: 2014, title: "热火被马刺 1-4", summary: "三巨头第 4 年磨损" },
      { year: 2018, title: "骑士被勇士 0-4", summary: "单核单挑四巨头" }
    ],
    data: [
      { label: "詹姆斯总决赛 10 进 4 冠", value: "胜率 40%", source: "NBA 官方数据" },
      { label: "杜兰特 5 进 2 冠胜率", value: "40%（同等）", source: "NBA 官方数据" },
      { label: "魔术师 9 进 5 冠胜率", value: "56%（次于乔丹）", source: "NBA 官方数据" }
    ],
    causes: [
      "「10 进 4 冠」分母是 10—1980 年后历史最多。8 年连续进总决赛是 60 年代凯尔特人王朝后无人能复制的成就。",
      "把胜率当唯一标尺就用一个人的奇迹（乔丹 6-0）否定所有其他球星。"
    ],
    background: "NBA 历史能 5 次以上进总决赛的球员屈指可数。詹姆斯 10 次是 1980 年后第一人，魔术师 9 次第二，乔丹 6 次第三。",
    analysis: "「4 冠 6 亚」是只看分子不看分母的偷换。10 次总决赛意味着 10 年里他都能把队伍带到最高舞台，比一辈子没进过总决赛的球星伟大无数倍。"
  },
  "black_team_hopping": {
    events: [
      { year: 2010, title: "决定一加入热火", summary: "巅峰跳槽开 NBA 巨星抱团先河" },
      { year: 2007, title: "凯尔特人三巨头", summary: "皮尔斯/加内特/雷阿伦同年抱团比热火早 3 年" },
      { year: 2016, title: "杜兰特加盟 73 胜勇士", summary: "更激进的抱团" }
    ],
    data: [
      { label: "凯尔特人三巨头时间", value: "2007 年（比热火早 3 年）", source: "NBA 历史" },
      { label: "詹姆斯热火 4 冠", value: "2 冠 2 FMVP", source: "NBA 官方数据" },
      { label: "杜兰特抱勇士", value: "2 冠 2 FMVP（更受批评）", source: "NBA 官方数据" }
    ],
    causes: [
      "「开创抱团」扣给詹姆斯是无视 2007 凯尔特人先例—皮尔斯/加内特/雷阿伦也是巨星抱团。",
      "球员自由市场选择是劳资协议规定的权利，不是道德问题。"
    ],
    background: "巨星抱团是 1960 年代起就有的 NBA 传统—罗素时代凯尔特人也是抱团。自由市场时代之后才有「主动抱团」vs「管理层抱团」的区别。",
    analysis: "把抱团鼻祖扣给詹姆斯是双标—2007 凯尔特人同样开创但没被批，2016 杜兰特更激进也只被骂半年。「巨星抱团是时代产物」才是真实评价。"
  },
  "black_three_teams": {
    events: [
      { year: 2010, title: "决定一去热火", summary: "骑士 7 年没二当家，他离开" },
      { year: 2014, title: "回归骑士", summary: "兑现「I'm coming home」承诺给家乡冠军" },
      { year: 2018, title: "加盟湖人", summary: "新挑战 + 商业 + 家庭考虑" }
    ],
    data: [
      { label: "詹姆斯三队 FMVP", value: "热火 2 + 骑士 1 + 湖人 1，史上唯一", source: "NBA 官方数据" },
      { label: "现代 NBA 球员平均效力球队", value: "4-6 支（30 岁以上巨星）", source: "NBA 劳资协议时代" },
      { label: "其他换过队的巨星", value: "乔丹（奇才）+ 卡尔马龙（湖人）+ 奥尼尔（6 队）", source: "NBA 历史" }
    ],
    causes: [
      "「三姓家奴」忽略了三次换队都给球队带来冠军 / FMVP，他是冠军搬运工不是逃兵。",
      "三次换队三个不同动机：管理层失望 / 回家承诺 / 新挑战，被简化成一种叙事是低质量评价。"
    ],
    background: "NBA 历史上 90%+ 巨星都换过队。一人一城是 NBA 神圣叙事但本质是个例—邓肯/科比/诺维斯基都靠管理层 20 年配名人堂队友才能做到。",
    analysis: "詹姆斯三队三 FMVP 是历史唯一。把换队定性为「叛逃」忽略了「他去哪里都给冠军」这个事实。冠军搬运工 vs 一人一城是两个伟大叙事。"
  },
  "black_ray_allen_saved": {
    events: [
      { year: 2013, title: "G6 雷阿伦底角三分", summary: "5 秒前的底角三分救主，热火 G7 夺冠" },
      { year: 2013, title: "詹姆斯整场 32 分", summary: "G6 詹姆斯个人 32 分 + 关键 ISO 创造空位" }
    ],
    data: [
      { label: "雷阿伦三分前一秒", value: "詹姆斯 ISO 突破造犯规", source: "比赛录像" },
      { label: "詹姆斯 2013 总决赛场均", value: "25.3 分 10.9 板 7 助 FMVP", source: "NBA 官方数据" },
      { label: "G7 詹姆斯绝杀贡献", value: "37 分 12 板 + 关键防守", source: "NBA 官方数据" }
    ],
    causes: [
      "雷阿伦三分是历史经典瞬间不可否认。但他三分前是詹姆斯的 ISO 创造的空位机会，不是单方面救主。",
      "G7 詹姆斯 37+12 + 关键防守才是真正的赢家。"
    ],
    background: "2013 总决赛热火 vs 马刺是 NBA 史上最经典对决之一。雷阿伦底角三分被视为 NBA 历史最伟大 5 大瞬间之一，但整轮 FMVP 是詹姆斯。",
    analysis: "「雷阿伦救命」是只看 G6 不看 G7 的偷换。整轮 FMVP 是詹姆斯，他 G7 37+12 才是真正决定冠军归属的表现。"
  },
  "black_kyrie_saved": {
    events: [
      { year: 2016, title: "G7 欧文绝杀三分", summary: "G7 最后 53 秒欧文三分确立胜势" },
      { year: 2016, title: "詹姆斯 chase-down block", summary: "G7 最后 2 分钟禁飞伊戈达拉" },
      { year: 2016, title: "詹姆斯整场三双", summary: "27/11/11/3 帽 2 断历史 G7 最强" }
    ],
    data: [
      { label: "G7 詹姆斯三双", value: "27 分 11 板 11 助 3 帽 2 断", source: "NBA 官方数据" },
      { label: "chase-down block", value: "比赛最后 1 分 50 秒，89-89 平", source: "比赛录像" },
      { label: "1-3 落后逆转 73 胜", value: "NBA 历史唯一", source: "NBA 历史" }
    ],
    causes: [
      "欧文绝杀三分功不可没。但 G7 詹姆斯整场三双 + 关键防守瞬间被忽略是偷换。",
      "1-3 落后逆转 73 胜常规赛历史第一勇士是历史唯一，不能压缩成「欧文救主」。"
    ],
    background: "2016 总决赛是 NBA 史诗级翻盘。骑士 1-3 落后情况下连胜 3 场，给克利夫兰带来 52 年首冠。这是历史唯一 1-3 翻盘案例。",
    analysis: "「欧文救命」是只看一颗球不看整轮的偷换。詹姆斯 G7 三双 + chase-down block 才是真正的封冠表现。"
  },
  "black_draymond_suspension": {
    events: [
      { year: 2016, title: "G4 格林裆部攻击", summary: "格林被联盟禁赛 G5" },
      { year: 2016, title: "格林禁赛后", summary: "骑士赢 G5 / G6 / G7 完成翻盘" }
    ],
    data: [
      { label: "格林禁赛理由", value: "累计技术犯规 + G4 攻击詹姆斯", source: "NBA 联盟通告" },
      { label: "禁赛 1 场", value: "勇士轮换调整失败", source: "NBA 历史" },
      { label: "詹姆斯禁赛后场均", value: "41/41/41（G5/G6/G7）", source: "NBA 官方数据" }
    ],
    causes: [
      "格林禁赛是格林自己作的—他攻击对手身体是被纪律行为，不是裁判帮詹姆斯。",
      "格林禁赛后詹姆斯仍要连续打 3 场 40+ 才能翻盘，不是禁赛就直接送冠军。"
    ],
    background: "格林禁赛是 NBA 史上最具争议的纪律决定之一。当时勇士已经 3-1 领先，禁赛可能影响系列走向，但联盟认为攻击身体动作必须罚。",
    analysis: "「格林禁赛」是只看外部因素不看詹姆斯自己 41/41/41 的偷换。即使没格林禁赛，詹姆斯也必须连续 3 场 40+，这个数据本身就是历史级。"
  },
  "black_stat_padding": {
    events: [
      { year: 2003, title: "新秀 20+5+5", summary: "詹姆斯生涯第一年就开始攒数据" },
      { year: 2023, title: "破贾巴尔得分纪录", summary: "全场起立庆祝" },
      { year: 2024, title: "突破 40000 总分", summary: "NBA 历史第一个 40000+" }
    ],
    data: [
      { label: "詹姆斯生涯命中率", value: "50.5%（外线锋历史顶级）", source: "NBA 官方数据" },
      { label: "4 个 MVP + 4 个 FMVP", value: "评委 + 球队 GM 投票，非数据自动生成", source: "NBA 官方数据" },
      { label: "连续 1297 场得分上双", value: "NBA 历史最长", source: "NBA 官方数据" }
    ],
    causes: [
      "「Excel 球王」是侮辱性昵称，本质说詹姆斯只能在表格里好看。",
      "但 4 MVP + 4 FMVP 是评委和球队 GM 投票的，不是数据自动生成的。"
    ],
    background: "数据时代很多球员被贬为「数据型」。但 MVP 和 FMVP 都是人评的，4+4 不可能是「刷表格」刷出来的。",
    analysis: "「刷数据」对詹姆斯不适用—他 4 MVP + 4 FMVP + 历史得分王 + 命中率 50.5%（外线锋顶级）。数据 + 奖项 + 效率三者都顶级，不存在「只是数字好看」。"
  },
  "black_411_project": {
    events: [
      { year: 2023, title: "詹姆斯破贾巴尔纪录", summary: "破纪录引发「411 工程」嘲讽" },
      { year: 2024, title: "突破 40000 总分", summary: "纪录持续被刷新" },
      { year: 2025, title: "41 岁继续打", summary: "20+ 赛季全明星历史唯一" }
    ],
    data: [
      { label: "詹姆斯生涯出勤率", value: "70%+（21 年里 1 次大伤）", source: "NBA 官方数据" },
      { label: "贾巴尔 20 年场均", value: "24.6（詹姆斯 21 年场均 27.2）", source: "NBA 官方数据" },
      { label: "20+ 赛季球员数量", value: "极少数（贾巴尔/邓肯/帕克）", source: "NBA 历史" }
    ],
    causes: [
      "「411 工程」是嘲讽詹姆斯靠工龄刷分。但持久性本身是稀缺技能。",
      "20+ 赛季能保持场均 25+ 是历史唯一，贾巴尔 20 年场均 24.6 都做不到。"
    ],
    background: "NBA 历史上 20+ 赛季球员屈指可数。能保持顶级数据的更少—贾巴尔/邓肯/帕克都达不到詹姆斯的水准。",
    analysis: "「靠工龄刷分」忽略了大多数球员 30 岁后已退役这个事实。詹姆斯 21 年保持高产是真本事。"
  },
  "black_no_skill": {
    events: [
      { year: 2003, title: "新秀年身体流惊艳", summary: "18 岁 NBA 新秀 20+5+5" },
      { year: 2013, title: "巅峰背身单打", summary: "热火时期开发出顶级背身技术" },
      { year: 2023, title: "41 岁仍场均 25+", summary: "身体衰退后靠技术维持顶级" }
    ],
    data: [
      { label: "詹姆斯生涯命中率", value: "50.5%（外线锋历史顶级）", source: "NBA 官方数据" },
      { label: "热火时期背身场均", value: "6.2 分（联盟前 5）", source: "NBA 官方数据" },
      { label: "41 岁阵地战占比", value: "75%（25% 快攻）", source: "腾讯新闻 2026" }
    ],
    causes: [
      "「靠身体没技术」忽略了詹姆斯的传球视野、挡拆发起、错位单挑都是顶级技术。",
      "41 岁身体退步后仍场均 25+，证明技术 ≥ 身体。"
    ],
    background: "NBA 历史上很多球员被贴「身体流」标签—张伯伦/巴克利/卡特。但他们都打到 30 岁就退出顶级。詹姆斯 41 岁还顶级 = 身体之外有真技术。",
    analysis: "「靠身体」对 41 岁的詹姆斯不成立。身体衰退后他靠传球 + 阅读 + 背身维持顶级数据，证明技术体系是真。"
  },
  "black_traveling": {
    events: [
      { year: 2015, title: "詹姆斯欧洲步", summary: "NBA 引入更宽松走步判罚" },
      { year: 2020, title: "联盟规则讨论", summary: "「走步免疫」成网络梗" }
    ],
    data: [
      { label: "詹姆斯生涯被吹走步次数", value: "联盟前列（不是免疫）", source: "NBA 数据" },
      { label: "现代 NBA 走步标准", value: "对所有球员统一", source: "NBA 规则" }
    ],
    causes: [
      "「走步免疫」是对联盟规则的误解—走步标准对所有球员一致。",
      "詹姆斯被吹走步次数生涯前列，不存在「免疫」。"
    ],
    background: "NBA 自 2010 年代欧洲步合法化后，走步判罚普遍宽松。这是对全联盟生效，不是对詹姆斯单独。",
    analysis: "「走步免疫」是阴谋论。NBA 没有理由对一个球员单独放水—裁判受联盟监督 + 公开录像复盘，做不了人情。"
  },
  "black_pass_clutch": {
    events: [
      { year: 2018, title: "G1 JR Smith 失误", summary: "最后 4.7 秒 JR 不知比分让平局" },
      { year: 2017, title: "G3 詹姆斯传 KCP", summary: "底角空位三分助攻" }
    ],
    data: [
      { label: "詹姆斯关键时刻命中率", value: "47%（联盟顶级）", source: "NBA Clutch 数据" },
      { label: "詹姆斯总决赛三双", value: "唯一总决赛场均 30+ 三双", source: "NBA 官方数据" },
      { label: "詹姆斯关键传球", value: "助攻队友绝杀次数联盟前列", source: "NBA 历史" }
    ],
    causes: [
      "「关键时刻传球」实质是篮球智商—他选了更高命中率的队友空位。",
      "把传球定性成「甩锅」是不懂篮球的偷换。"
    ],
    background: "现代 NBA 数据分析普及，传球给空位队友是公认的正确选择。乔丹 / 科比时代「我自己投」是文化产物，不等于正确决策。",
    analysis: "詹姆斯关键时刻命中率 47% 是联盟顶级，不存在「不敢投」。他选传是为了更高的进球概率，是正确决策不是怯懦。"
  },
  "black_no_defense": {
    events: [
      { year: 2013, title: "防守最佳阵容", summary: "连续 5 年入选 12-13 防守效率联盟第一" },
      { year: 2016, title: "chase-down block", summary: "G7 历史经典追防大帽" },
      { year: 2023, title: "季后赛护框率", summary: "38 岁季后赛防守效率联盟前 10%" }
    ],
    data: [
      { label: "詹姆斯连续 5 年最佳防守阵容", value: "热火时期", source: "NBA 官方" },
      { label: "12-13 防守效率", value: "联盟第一", source: "NBA 官方数据" },
      { label: "对位球员命中率", value: "平均下降 4.2%", source: "今日头条数据" }
    ],
    causes: [
      "「不防守」忽略了詹姆斯热火时期最佳防守阵容 + 连续 5 年。",
      "现役选择性防守是 41 岁的体力管理，不是态度问题。"
    ],
    background: "NBA 老将普遍常规赛划水保季后赛—杜兰特 35+ 也这样。詹姆斯 41 岁选择性防守符合年龄规律。",
    analysis: "「不防守」是只看现役不看巅峰的偷换。詹姆斯热火时期是最佳防守阵容常客，现在是 41 岁老将。两个标准不能横比。"
  },
  "black_east_weak": {
    events: [
      { year: 2011, title: "詹姆斯进总决赛", summary: "代表东部进总决赛输小牛" },
      { year: 2014, title: "8 年东部连胜", summary: "2011-2018 连续 8 次进总决赛" }
    ],
    data: [
      { label: "詹姆斯 8 年东部冠军", value: "2011-2018 连续", source: "NBA 官方数据" },
      { label: "东部历史冠军球队", value: "凯尔特人 17 / 湖人 17 同步", source: "NBA 历史" },
      { label: "东部强队历史", value: "活塞坏小子 / 公牛王朝 / 凯尔特人三巨头", source: "NBA 历史" }
    ],
    causes: [
      "「东部红利」忽略了东部历史上王朝 / 强队同样多—公牛 6 冠 / 活塞 / 凯尔特人三巨头都在东部。",
      "8 年连续从东部出线本身需要击败所有东部对手，是地狱难度。"
    ],
    background: "NBA 强弱分布按时代变化—80s 西部强 / 90s 东部强 / 00s 西部强 / 10s 东西部交替。把詹姆斯时代东部定性「弱」是片面取样。",
    analysis: "8 年连续从东部出线是历史性成就。即使东部相对弱（争议性的），詹姆斯击败的也是「所有当年东部对手」，不能简化成「躺赢」。"
  },
  "black_bubble_ring": {
    events: [
      { year: 2020, title: "湖人园区夺冠", summary: "Disney 园区无观众闭环 4-2 击败热火" },
      { year: 2020, title: "詹姆斯第 4 FMVP", summary: "成为史上首个三队 FMVP" }
    ],
    data: [
      { label: "2020 总决赛詹姆斯", value: "29.8 分 11.8 板 8.5 助 FMVP", source: "NBA 官方" },
      { label: "园区规则", value: "对所有 22 支参赛队同时生效", source: "NBA 通告" },
      { label: "历史特殊冠军", value: "76 凯尔特人 / 99 缩水 / 19 猛龙都无人黑", source: "NBA 历史" }
    ],
    causes: [
      "「泡泡冠军」忽略了规则对 22 支队同时生效—没人为湖人单独开后门。",
      "如果泡泡能扣冠军，99 缩水 / 76 合并前 / 19 猛龙都得同标准打折。"
    ],
    background: "2020 是疫情下特殊赛季。NBA 在 Disney 园区闭环，所有球队同样条件比赛。这是史无前例但所有队公平。",
    analysis: "「泡泡冠军」是特殊条件 + 双标。规则相同时赢的人就是赢，输的人不能反过来说规则不算。"
  },
  "black_self_goat": {
    events: [
      { year: 2018, title: "詹姆斯自称 GOAT", summary: "采访自称是 GOAT 引发争议" },
      { year: 2023, title: "破贾巴尔纪录", summary: "GOAT 讨论重燃" }
    ],
    data: [
      { label: "詹姆斯 GOAT 评级", value: "ESPN / The Athletic 排名前 3", source: "媒体投票" },
      { label: "詹姆斯生涯荣誉", value: "4 冠 / 4 FMVP / 4 MVP / 历史得分王", source: "NBA 官方" },
      { label: "乔丹 GOAT 评级", value: "公认历史第一", source: "媒体共识" }
    ],
    causes: [
      "「自封 GOAT」是采访片段被断章取义。原话是「我相信自己是 GOAT」，是自信表达不是断言。",
      "球员相信自己最强是顶级竞技心态，不是道德问题。"
    ],
    background: "乔丹 / 科比 / 张伯伦都公开表达过自己是历史第一。这是顶级运动员的常态心理，不是詹姆斯独有。",
    analysis: "「自封 GOAT」是话术陷阱。任何球星都自信自己最强，这是竞技心态不是傲慢。把这种表达定性「自吹」是双标—乔丹科比都说过类似话没人黑。"
  },
  "black_media_hype": {
    events: [
      { year: 2003, title: "高中钦点", summary: "SI 封面「Chosen One」" },
      { year: 2008, title: "首个 MVP", summary: "媒体期待已久的结果" }
    ],
    data: [
      { label: "詹姆斯 MVP 票数", value: "4 次都是压倒性票数", source: "NBA MVP 投票" },
      { label: "GOAT 讨论中詹姆斯排名", value: "前 3 公认", source: "媒体投票" },
      { label: "詹姆斯商业代言", value: "Nike 终身合同等亿万级", source: "Forbes 数据" }
    ],
    causes: [
      "「媒体捧」忽略了詹姆斯真实成就匹配媒体预期。",
      "高中钦点是 SI 编辑团队判断，结果证明判断正确，不是事后补构造。"
    ],
    background: "NBA 历史上「天选之子」预言大多落空—奥登 / 沙巴兹 / 维金斯。詹姆斯是少数兑现的—从「钦点」到「兑现」证明 SI 当时判断准。",
    analysis: "「媒体捧」对兑现承诺的球星不成立。詹姆斯的成就（4 冠 4 FMVP 4 MVP 历史得分王）远超「媒体捧」能造的水准。"
  },
  "black_bronny_nepotism": {
    events: [
      { year: 2024, title: "布朗尼第二轮选秀", summary: "湖人选詹姆斯儿子被指任人唯亲" },
      { year: 2024, title: "首次父子同场", summary: "NBA 历史首次父子同队比赛" }
    ],
    data: [
      { label: "布朗尼选秀位置", value: "第 55 顺位（次轮末，不是高顺位）", source: "NBA 选秀" },
      { label: "湖人选秀权", value: "球队自由选择，规则允许", source: "NBA 劳资协议" },
      { label: "布朗尼实际场上时间", value: "限制使用，G-League 锻炼为主", source: "NBA 数据" }
    ],
    causes: [
      "「任人唯亲」忽略了布朗尼是次轮第 55 顺位（不是高位），球队自由选择不违规。",
      "父子同队是 NBA 历史第一次，是商业噱头不是体育公平问题。"
    ],
    background: "NBA 历史上有过父子同队的概念但从未实现。布朗尼实现这个意义大于场上贡献。湖人作为球队有选择权。",
    analysis: "「任人唯亲」对第 55 顺位次轮选不成立—这种位置选秀本来就是教练 / 球队随便挑。詹姆斯的影响力可能让布朗尼比其他第 55 顺位多打几场，但这是球队商业决策，不是 NBA 公平性问题。"
  },
  "black_legm": {
    events: [
      { year: 2018, title: "詹姆斯影响球员引进", summary: "湖人交易得到浓眉" },
      { year: 2024, title: "詹姆斯儿子被选", summary: "影响力被指 LeGM" }
    ],
    data: [
      { label: "詹姆斯转会成功率", value: "三队都拿 FMVP", source: "NBA 历史" },
      { label: "LeGM 案例", value: "热火韦德 / 骑士欧文 / 湖人浓眉", source: "媒体报道" },
      { label: "其他巨星 GM 化", value: "保罗 / 杜兰特 / 哈登都参与", source: "NBA 历史" }
    ],
    causes: [
      "「LeGM」忽略了巨星参与球队建设是 NBA 现代趋势—保罗 / 杜兰特 / 哈登都这样。",
      "詹姆斯的「GM 化」每次都给球队带来冠军 / FMVP，效果证明判断对。"
    ],
    background: "NBA 现代球员有更大话语权是劳资协议演变的结果。巨星介入球队建设从 90 年代乔丹时期就开始，不是詹姆斯发明。",
    analysis: "「LeGM」是只看影响力不看结果的偷换。三队都拿 FMVP 证明他的判断对球队是有利的，不是「破坏」。"
  },
  "black_cornerstone_ring": {
    events: [
      { year: 2016, title: "骑士首冠", summary: "詹姆斯给克利夫兰 52 年首冠" },
      { year: 2020, title: "湖人园区冠军", summary: "三队 FMVP 历史唯一" }
    ],
    data: [
      { label: "詹姆斯三队 FMVP", value: "热火 2 / 骑士 1 / 湖人 1", source: "NBA 官方" },
      { label: "其他多队 FMVP 球员", value: "卡里姆贾巴尔（雄鹿+湖人）已是历史前列", source: "NBA 历史" },
      { label: "詹姆斯 1-3 翻盘 73 胜", value: "NBA 历史唯一", source: "NBA 历史" }
    ],
    causes: [
      "「基石冠军」忽略了詹姆斯每次都是球队 FMVP—他是核心不是基石配角。",
      "三队 FMVP 历史唯一证明他是真核心。"
    ],
    background: "NBA 历史上球员转队后立刻成为冠军核心的极少。詹姆斯做到 3 次是历史唯一。",
    analysis: "「基石」对 FMVP 不成立—FMVP 是 Finals MVP，是公认的冠军核心。詹姆斯三队 FMVP 等于三次「核心」证明。"
  },
  "black_2007_swept": {
    events: [
      { year: 2007, title: "首次进总决赛", summary: "詹姆斯 22 岁单核带骑士 0-4 输马刺" },
      { year: 2007, title: "对手是马刺 GDP", summary: "邓肯 + 帕克 + 吉诺比利名人堂三人" }
    ],
    data: [
      { label: "詹姆斯 22 岁", source: "NBA 历史", value: "总决赛历史最年轻 MVP 候选之一" },
      { label: "2007 马刺战绩", value: "58 胜 + 冠军 + GDP 巅峰", source: "NBA 官方" },
      { label: "骑士 1.0 队友", value: "古登 / 拉里休斯 / 大 Z（无全明星）", source: "NBA 历史" }
    ],
    causes: [
      "22 岁第一次进总决赛对面是名人堂三人组的马刺—被横扫不是耻辱是地狱难度。",
      "骑士队友是 NBA 历史最弱总决赛阵容之一，单核怎么打都输。"
    ],
    background: "2007 总决赛是 NBA 史上最具悬殊的对决之一—巅峰 GDP 马刺 vs 单核新秀詹姆斯。结果在赛前已经被预测到。",
    analysis: "「2007 被横扫」是只看分子不看分母的偷换。22 岁单核带烂队进总决赛已经是历史级成就，输给冠军级对手不是耻辱。"
  },
  "compare_kobe_5_rings": {
    events: [
      { year: 2000, title: "科比首冠（OK 组合）", summary: "00-02 三连冠 FMVP 全是奥尼尔" },
      { year: 2009, title: "科比第 4 冠（加索尔）", summary: "09 / 10 靠加索尔西班牙金童" },
      { year: 2010, title: "科比 5 冠完成", summary: "湖人 4-3 凯尔特人" }
    ],
    data: [
      { label: "科比 00-02 三连冠 FMVP", value: "全是奥尼尔", source: "NBA 官方" },
      { label: "科比 04-07 单核期间", value: "4 年只 1 次西决", source: "NBA 官方" },
      { label: "科比 09 / 10 队友", value: "加索尔（西班牙金童）+ 拜纳姆（全明星）", source: "NBA 历史" }
    ],
    causes: [
      "科比 5 冠中 3 冠 FMVP 是奥尼尔，2 冠靠加索尔 + 拜纳姆。",
      "纯单核期间（04-07）4 年 0 总决赛—说明单核能力 ≤ 詹姆斯。"
    ],
    background: "「科比 5 冠 vs 詹姆斯 4 冠」是只看数字不看队友的简化对比。同标准下科比 5 冠都有名人堂队友，詹姆斯 4 冠也都有。",
    analysis: "5 冠 vs 4 冠是分子之差，但要看分母—科比无队友期间 0 总决赛，詹姆斯单核期间 10 进 4 冠（含 1-3 翻盘 73 胜）。单核能力詹姆斯 > 科比。"
  },
  "compare_curry_changed_game": {
    events: [
      { year: 2015, title: "库里首个 MVP + 冠军", summary: "勇士 4-2 骑士首冠" },
      { year: 2016, title: "73 胜历史第一", summary: "全票 MVP + 73-9 战绩" },
      { year: 2022, title: "库里第一个 FMVP", summary: "无杜情况下夺冠 + FMVP" }
    ],
    data: [
      { label: "库里改变三分时代", value: "联盟三分出手大幅增加", source: "NBA 数据" },
      { label: "库里冠军数", value: "4 冠 + 1 FMVP", source: "NBA 官方" },
      { label: "詹姆斯冠军数", value: "4 冠 + 4 FMVP", source: "NBA 官方" }
    ],
    causes: [
      "库里改变三分时代是真的，但冠军数 4-4 不能压倒詹姆斯。",
      "FMVP 数 4-1 詹姆斯绝对优势，证明他是更纯粹的冠军核心。"
    ],
    background: "库里和詹姆斯是同时代两大巨星。库里的革命是技术 + 风格层面，詹姆斯的成就是冠军 + 数据层面。两人是不同维度的伟大。",
    analysis: "「库里改变篮球 > 詹姆斯」是单维度比较。如果按改变篮球评价 → 库里优势；按冠军 + FMVP + 数据评价 → 詹姆斯优势。两者不能简单压倒。"
  },
  "compare_curry_head_to_head": {
    events: [
      { year: 2015, title: "詹姆斯 vs 库里 1-1", summary: "首次总决赛詹姆斯输 2-4" },
      { year: 2016, title: "詹姆斯 4-3 库里", summary: "1-3 翻盘 73 胜" },
      { year: 2017, title: "库里 4-1 詹姆斯", summary: "杜兰特加盟后勇士" }
    ],
    data: [
      { label: "总决赛对决", value: "4 次（2015/16/17/18）", source: "NBA 历史" },
      { label: "总决赛战绩", value: "詹姆斯 1-3（但 16 年 1-3 翻盘是历史唯一）", source: "NBA 官方" },
      { label: "G7 历史唯一对决", value: "詹姆斯 vs 库里 G7 詹姆斯 27/11/11", source: "NBA 历史" }
    ],
    causes: [
      "总决赛 1-3 是分母差—库里身边是杜兰特三巨头 / 詹姆斯有时只有乐福。",
      "G7 历史唯一对决是詹姆斯赢的（2016）。"
    ],
    background: "詹姆斯 vs 库里总决赛 4 次是 NBA 历史最多对决之一。但每次双方阵容深度差距大。",
    analysis: "「詹姆斯总决赛输库里多」忽略了对手阵容差距—库里 17/18 有杜兰特，詹姆斯没有。历史唯一 G7 是詹姆斯赢的，含金量最高。"
  },
  "compare_duncan_5_rings": {
    events: [
      { year: 1999, title: "邓肯首冠", summary: "新秀年夺冠" },
      { year: 2014, title: "邓肯第 5 冠", summary: "莱昂纳德 FMVP" }
    ],
    data: [
      { label: "邓肯队友", value: "吉诺比利 + 帕克 名人堂双星 + 莱昂纳德 FMVP", source: "NBA 历史" },
      { label: "邓肯 19 年一人一城", value: "马刺管理层 19 年配队友", source: "NBA 历史" },
      { label: "邓肯 5 冠 FMVP 数", value: "3 次（比科比 1 FMVP 多）", source: "NBA 官方" }
    ],
    causes: [
      "邓肯 5 冠靠马刺管理层 19 年持续配名人堂队友。骑士 1.0 给詹姆斯 7 年都没有。",
      "「一人一城」本质是有靠谱管理层的特权，不是球员道德高度。"
    ],
    background: "邓肯 5 冠 3 FMVP 是真伟大，但他从未单核打过类似 2018 詹姆斯那种「单挑四巨头」的局面—因为马刺一直配齐了。",
    analysis: "「邓肯 5 冠 > 詹姆斯 4 冠」对比的是不同时代不同球队。两人都伟大，但詹姆斯 1-3 翻盘 73 胜 + 三队 FMVP 是邓肯没做到的独特成就。"
  },
  "compare_durant_finals": {
    events: [
      { year: 2017, title: "杜兰特加勇士首冠", summary: "FMVP 全票级" },
      { year: 2018, title: "杜兰特连续 FMVP", summary: "卷土重来" }
    ],
    data: [
      { label: "杜兰特 5 进总决赛", value: "2 冠胜率 40%", source: "NBA 官方" },
      { label: "詹姆斯 10 进总决赛", value: "4 冠胜率 40%", source: "NBA 官方" },
      { label: "杜兰特抱团勇士", value: "73 胜抱团（更激进）", source: "NBA 历史" }
    ],
    causes: [
      "杜兰特 5 进 2 冠胜率 40%—和詹姆斯 10 进 4 冠完全一样。",
      "但杜兰特抱团 73 胜比詹姆斯抱团韦德 + 波什更激进，没人黑得更狠。"
    ],
    background: "杜兰特和詹姆斯是同时代两大巨星。两人胜率相同（40%），但分母不同（10 vs 5）。",
    analysis: "「胜率论」对詹姆斯不公平—他分母是 10（历史 1980 后第一人），杜兰特是 5。10 进 4 冠 vs 5 进 2 冠，詹姆斯绝对值更高。"
  },
  "compare_jokic_advanced": {
    events: [
      { year: 2023, title: "约基奇首冠", summary: "Nuggets 4-1 热火" },
      { year: 2024, title: "约基奇第 3 MVP", summary: "现役 MVP 王" }
    ],
    data: [
      { label: "约基奇生涯", value: "10+ 年（还在巅峰）", source: "NBA 历史" },
      { label: "詹姆斯生涯", value: "21 年（已是传奇）", source: "NBA 历史" },
      { label: "约基奇 vs 詹姆斯历史地位", value: "约基奇是现役 MVP 王，詹姆斯是历史前 3", source: "媒体共识" }
    ],
    causes: [
      "约基奇巅峰期短，目前 10 年。詹姆斯 21 年仍顶级。",
      "拿巅峰球员的「现役高度」和老将的「历史成就」对比是不公平的。"
    ],
    background: "约基奇被誉为现役 MVP 王，但仅 1 冠。詹姆斯 4 冠 + 历史得分王是几十年才出一个的级别。",
    analysis: "约基奇是现役神迹，詹姆斯是历史神迹。两个不同时间维度，不能直接横比。"
  }
}

module.exports = { extendedById }
