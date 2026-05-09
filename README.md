# 詹姆斯黑粉观点反驳器

微信小程序本地原型。第一版不接云函数、不接数据库、不接 DeepSeek/豆包 API。

## 运行方式

1. 打开微信开发者工具。
2. 导入本目录 `lebron-rebuttal-miniapp`。
3. AppID 可选择测试号。
4. 编译运行。

## 第一版能力

- 本地黑点别名匹配
- 20 条 sample 反驳卡
- 分类命中展示
- 简短版、逻辑版、一句话、视频口播版
- 一键复制
- 随机反驳

## 后续接入

DeepSeek/豆包 API Key 不能放在小程序前端。后续通过 CloudBase 云函数转发调用。

## 文件作用

- `miniprogram/data/categories.js`: 30 类细分黑点分类和短关键词体系。
- `miniprogram/data/aliases.js`: 评论区短词、黑称、梗到反驳卡的映射。
- `miniprogram/data/rebuttal_cards.js`: 第一版 20 条本地反驳卡。
- `miniprogram/data/player_comparisons.js`: 同标准横向对比对象。
- `miniprogram/utils/normalizeQuery.js`: 用户输入归一化。
- `miniprogram/utils/matchQuery.js`: 本地模糊匹配和 fallback。
- `miniprogram/utils/promptBuilder.js`: 后续接 DeepSeek/豆包时的 prompt 组装占位。
- `miniprogram/pages/index/*`: 首页搜索、生成、展示、复制。

## 测试词

- `8分`
- `米奇冠军`
- `科比五冠`
- `Excel球王`
- `老张跑路`
- `摊皇不回防`
- `库里改变篮球`
- `LeGM`
