# 詹黑逻辑拆解器 - Press Kit

> 媒体 / 投稿 / 转载素材包。所有内容可自由引用，注明出处即可。

---

## 项目一句话

**练手项目：把 LeBron 詹姆斯的常见黑粉话术拆解成结构化反驳卡的微信小程序。**

---

## 30 秒介绍

打开小程序 → 输入"8 分释兵权" / "Excel 球王" / "米奇冠军" → 系统秒出反驳卡（短刀 / 封口 / 长拆 / 口播 4 种模式）→ 一键复制怼回评论区。配套段位 / 勋章 / 测试 H5 / 23 号彩蛋等娱乐组件。

---

## 数据规模

| 维度 | 数量 |
|---|---|
| 反驳卡总数 | **215 张**（base 100 + extra 7 + docx 50 + v2.1 15 + stars 21 + legends 7 + v2.5 15） |
| 短梗 / 别名 / 黑称映射 | **730 条** |
| 争议分类 | **46 类** |
| 深度素材卡 | **10 张**（含 events / data / causes / background / analysis 五维结构） |
| 独立页面 | **14 个**（index / result / about / easter / quiz / privacy / history / favorites / onboarding / leaderboard / pk / daily / chat / meme） |
| 自动化测试 | **前端 12 个 + 后端 9 步 curl smoke**（GitHub Actions matrix: Node 18 + 20） |
| 后端 API | **5 个**（leaderboard / pk/submit / daily/checkin / llm/enhance / chat） |
| 数据库 | **MySQL 4 张表**（云托管内置） |

---

## Logo concept

**描述性**（无需真画）：

- 形状：圆角矩形（rounded rect, radius 16）
- 底色：湖人金 `#fbbf24`
- 主元素：白色 `LBR` 缩写居中
- 副元素：右上角 23 号字样（小号，金色微透）
- 比例：1:1（正方形头像位）
- 字体：粗黑体 / Impact 类

可选变体：
- 紫底金字（深色模式）
- 23 号大字作为水印底纹

---

## 推荐截图（5 张关键）

| # | 截图 | 内容 | 文件位 |
|---|---|---|---|
| 1 | 首页 hero | 紫金背景 + 23 号巨型水印 + 搜索框 + 热梗 chips | `docs/screenshots/01-home.png` |
| 2 | 段位 + 勋章墙 | 关于页 5 段位进度条 + 6 勋章解锁状态 | `docs/screenshots/02-about.png` |
| 3 | 球迷测试结果页 | 5 题完成 → "X 级詹蜜" 中性化结果卡 | `docs/screenshots/04-quiz.png` |
| 4 | 23 号秘藏彩蛋 | 长按 hero 触发 → 生涯里程碑墙 + 巨型 23 号水印 | `docs/screenshots/03-easter.png` |
| 5 | 分享卡片输出 | 紫金风格分享卡 + 反驳金句 + 二维码占位 | `docs/screenshots/05-share.png` |

> 截图清单完整版见 [`docs/SCREENSHOT_GUIDE.md`](./SCREENSHOT_GUIDE.md)

---

## 技术亮点

### 本地优先 + 全栈兜底
- 215 反驳卡 / 730 别名 / 46 分类全部打包进小程序，**完全离线可用**
- 双模式 API 调度：`wx.cloud.callContainer` 优先 + `wx.request` HTTPS fallback + 本地 mock 兜底
- 任何网络调用失败都降级到本地卡，用户感知是「网络慢」不是「崩了」

### 全栈架构（v2.6+）
- 后端：Node 18 + Express 4，部署微信云托管（服务名 `express-fjva`）
- 数据库：MySQL（云托管内置）4 张表，PK 提交走事务
- AI 增强：DeepSeek V4 Flash 通过 `POST /api/llm/enhance` 后端代理，**API key 永不出客户端**
- v2.10 起 `wx.cloud.callContainer` 直连云托管，零域名 + 零 ICP 备案

### 零新依赖（前端）
- 原生微信小程序 + TDesign Mini-Program 1.14
- 无 Taro / 无 uni-app / 无 webpack / 无 vite
- 无构建步骤，导入即跑

### 测试覆盖
- 前端 12 个 npm scripts：syntax / match / corpus / ai-fallback / progression / safety / feedback / matchquery / storage / duel / prompt / api-cloud
- 后端 9 步 curl smoke（`server/test-api.sh`，可选 DeepSeek 真实联调）
- GitHub Actions matrix（Node 18 + 20）每次 push / PR 自动跑

### Prompt 工程
- v2.8 → v2.8.5 共 6 版迭代（详见 `docs/PROMPT_VERSIONS.md`）
- `scripts/test-prompt-adversarial.js` 10 类离线对抗 dry-run（prompt injection / 角色覆写 / 模板化金句等），不烧 DeepSeek token

---

## 联系方式

| 渠道 | 地址 |
|---|---|
| GitHub | [github.com/clavelinaswykoniki-cell/LeBron](https://github.com/clavelinaswykoniki-cell/LeBron) |
| Issues | [github.com/clavelinaswykoniki-cell/LeBron/issues](https://github.com/clavelinaswykoniki-cell/LeBron/issues) |
| License | [MIT](https://github.com/clavelinaswykoniki-cell/LeBron/blob/main/LICENSE) |

---

## 免责声明

练手项目 + 作品集。所有篮球观点仅为娱乐讨论，不代表 NBA 官方立场，不构成对任何球员的人身攻击。

- 反驳卡内容基于公开球迷讨论 / 公开数据 / 第三方分析整理
- 别名表包含部分网络黑称，仅用于识别匹配，不会主动作为输出
- 用户输入 0 数据收集，全部本地存储
- 微信审核合规，无敏感词主动 CTA，无敏感内容

---

## 快速复制片段（媒体可直接用）

### 推特 / Twitter（280 字符）

> 詹黑逻辑拆解器：微信小程序，把评论区黑 LeBron 的话术（"8 分释兵权""Excel 球王""米奇冠军"）拆成结构化反驳卡。215 反驳卡 / 730 别名 / 14 页面 / 全栈（Express + MySQL + DeepSeek，部署微信云托管）。GitHub: github.com/clavelinaswykoniki-cell/LeBron

### 微博（140 字以内）

> 詹黑逻辑拆解器：一个把 LeBron 詹黑话术拆成结构化反驳的微信小程序。输入黑点 → 自动匹配反驳卡 → 一键复制怼回去。215 张反驳卡 / 730 别名 / 46 分类。练手项目，GitHub 开源。

### 即刻 / 朋友圈

> 上周末练手做的微信小程序：詹黑逻辑拆解器 🎯
>
> 痛点：评论区 LeBron 的黑点千篇一律（"8 分释兵权""Excel 球王""米奇冠军""科比五冠"）。每次都要打字回怼太累。
>
> 解法：把这些黑点全做成结构化反驳卡（短刀 / 封口 / 长拆 / 口播 4 种模式），输入秒出，一键复制。
>
> 数据：215 反驳卡 / 730 别名 / 46 分类 / 14 页面 / 4 表 / 5 API / 12 测试 / GitHub Actions CI。
>
> 技术：原生小程序 + TDesign + Express + MySQL 全栈，部署微信云托管，DeepSeek 增强反驳通过后端代理（key 不进前端）。
>
> GitHub: github.com/clavelinaswykoniki-cell/LeBron
