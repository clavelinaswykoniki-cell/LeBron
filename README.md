# 詹姆斯黑粉观点反驳器

微信小程序本地原型。第一版不接云函数、不接数据库、不接 DeepSeek/豆包 API。

## 运行方式

1. 打开微信开发者工具。
2. 导入本目录 `lebron-rebuttal-miniapp`。
3. AppID 可选择测试号。
4. 编译运行。

## 第一版能力

- 本地黑点别名匹配
- 147 条 sample 反驳卡
- 428 条短关键词/黑称/梗映射
- 分类命中展示
- 简短版、逻辑版、一句话、视频口播版
- 一键复制
- 随机反驳
- 可选 AI 增强按钮，CloudBase 不可用时自动回退本地卡

## 后续接入

DeepSeek API Key 不能放在小程序前端。AI 增强通过 CloudBase 云函数 `generateReply` 转发调用，默认模型使用 `deepseek-v4-pro`。真实 Key 只能配置在 CloudBase 环境变量 `DEEPSEEK_API_KEY`。

## 文件作用

- `miniprogram/data/categories.js`: 30 类细分黑点分类和短关键词体系。
- `miniprogram/data/aliases.js`: 评论区短词、黑称、梗到反驳卡的映射。
- `miniprogram/data/rebuttal_cards.js`: 基础本地反驳卡。
- `miniprogram/data/rebuttal_cards_extra.js`: 乔丹、科比、库里、邓肯、杜兰特、约基奇等对比扩展卡。
- `miniprogram/data/rebuttal_cards_docx.js`: Word 语料清洗后的独立反驳卡，含 review_needed 记录但不进入匹配。
- `miniprogram/data/aliases_extra.js`: 对比黑点短词、黑称、梗的扩展映射。
- `miniprogram/data/aliases_docx.js`: Word 语料清洗后的高意图别名映射。
- `miniprogram/data/arsenal.js`: 统一数据入口，汇总基础、扩展和 docx 语料。
- `miniprogram/data/player_comparisons.js`: 同标准横向对比对象。
- `miniprogram/data/factual_sources.js`: 后续 RAG/模型调用使用的事实来源卡。
- `miniprogram/data/rebuttal_templates.js`: 后续模型生成使用的回复结构模板。
- `miniprogram/utils/normalizeQuery.js`: 用户输入归一化。
- `miniprogram/utils/matchQuery.js`: 本地模糊匹配和 fallback。
- `miniprogram/utils/llmProvider.js`: 前端调用 CloudBase `generateReply` 的薄封装，失败返回本地卡。
- `miniprogram/utils/promptBuilder.js`: 后续接 DeepSeek/豆包时的 prompt 组装占位。
- `miniprogram/pages/index/*`: 首页搜索、生成、展示、复制。
- `cloudfunctions/generateReply/*`: CloudBase 调 DeepSeek v4 pro 的云函数结构，不包含真实 API Key。
- `scripts/test-match.js`: 本地关键词命中测试。

## 本地检查

```bash
npm run check:syntax
npm run test:match
npm run test:corpus
npm run test:ai-fallback
```

## 测试词

- `8分`
- `米奇冠军`
- `科比五冠`
- `Excel球王`
- `老张跑路`
- `摊皇不回防`
- `库里改变篮球`
- `LeGM`
- `基石冠军`
- `没有得分王`
- `乔丹6-0`
- `宇宙勇`
- `联盟保送`
- `历史第二十`
- `文班未来超詹`
- `乔丹没抢七`
- `科比一人一城`
- `库里全票MVP`
- `邓肯低调`
- `杜兰特单挑`
- `约基奇组织`
