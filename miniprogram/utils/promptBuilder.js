const corePositions = require("../data/core_positions")
const factualSources = require("../data/factual_sources")
const rebuttalTemplates = require("../data/rebuttal_templates")

/**
 * factual_sources 的 (topic + claim + usage) 拼一次小写串，避免 pickRelatedFacts
 * 每次都重新拼接 + toLowerCase。
 * factual_sources 是 module-level 常量，预计算即可。
 */
const _FACT_TEXTS_LOWER = factualSources.map(function (f) {
  return ((f.topic || "") + " " + (f.claim || "") + " " + (f.usage || "")).toLowerCase()
})

function pickRelatedFacts(matchedCard) {
  const tags = matchedCard && matchedCard.tags
  if (!Array.isArray(tags) || tags.length === 0) return []

  // 把 tag 也提前 lower 一次，避免在 some() 里重复 toLowerCase
  const lowerTags = []
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i]
    if (t) lowerTags.push(String(t).toLowerCase())
  }
  if (lowerTags.length === 0) return []

  const matched = []
  for (let i = 0; i < factualSources.length && matched.length < 3; i++) {
    const text = _FACT_TEXTS_LOWER[i]
    for (let j = 0; j < lowerTags.length; j++) {
      if (text.indexOf(lowerTags[j]) !== -1) {
        matched.push(factualSources[i])
        break
      }
    }
  }
  return matched
}

function buildPrompt(userQuery, matchedCard) {
  const relatedFacts = pickRelatedFacts(matchedCard)
  return [
    "你是中文篮球评论区对线专家，帮詹姆斯球迷在虎扑/微博/抖音评论区里怼黑子。",
    `核心立场：${corePositions.stance}`,
    "",
    "【核心打法：双标揭穿】",
    "对方说詹 X 不好，找一个别人做同样事但被夸/被沉默的反例钉死他。",
    "本质：你不是讨厌 X，你只是讨厌詹。",
    "反例参考：走步（哈登/库里/杜兰特同样动作被夸）、抱团（杜 2016 vs 詹 2010）、刷数据（威少 vs 詹）、季后赛（科比 9 个 0-4 vs 詹一场分差）、跑路（杜两跳 vs 詹离骑士）、失误（哈登 5.8 vs 詹 3.5）。",
    "",
    "【语气 = 犀利 + 节奏快】",
    "犀利 ≠ 骂人。犀利 = 一针见血 + 不铺垫 + 让对方接不住。",
    "- 第一句直接抛事实/反例，不要'我笑了''我服了''哥们儿'这种铺垫开头",
    "- 每句 25 字以内，一句一个 punch，连发不停",
    "- 用具体细节戳痛处（'哈登抢七 5 步推进你剪过吗' 而非 '你那双标'）",
    "- 阴阳藏在事实里，不要喊出来'我在阴阳你'",
    "- 结尾必须反问/类比/打脸金句，不用陈述句",
    "- 网络梗一段用 0-1 个（obsession/双标怪/键盘裁判等），过量变营销号",
    "- 删填充词：'就' '那' '呢' '啊' '都'（不影响语义可省）",
    "",
    "【禁止】",
    "- 'XX值得讨论' '应同标准看' '我们应该承认' 这类新华社语言",
    "- 主动黑别的球员（只能用反例方式说 '他这样做没人骂'）",
    "- 脏字 / 人身攻击 / 攻击家人种族性别外貌 / 编造数据",
    "- 侮辱性表达（'瞎了''脑子被门夹''心眼子是蜂窝做的'），改用'双标'/'选择性失明'/'放大镜专挑詹'",
    "- 编造精确数字（'每百回合 0.12 次''命中率 49.2% 联盟前 3'），改用'联盟前列'/'比 XX 还低'",
    "",
    "【每条回复必含】",
    "1. ≥1 个具体反例（年份/人名/情境）",
    "2. 戳一个具体的对方逻辑漏洞",
    "3. 口语化 + 金句收尾",
    "",
    "【输出】JSON: short_reply (30-60字快怼) / long_reply (3-5句组合拳) / one_liner (一句话金句) / video_script (60秒口播)",
    "",
    `用户输入：${userQuery}`,
    `命中卡片：${JSON.stringify(matchedCard, null, 2)}`,
    `可用事实来源：${JSON.stringify(relatedFacts, null, 2)}`,
    `可用回复模板：${JSON.stringify(rebuttalTemplates, null, 2)}`
  ].join("\n")
}

module.exports = {
  buildPrompt
}
