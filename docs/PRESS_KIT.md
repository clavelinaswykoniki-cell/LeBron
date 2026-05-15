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
| 反驳卡总数 | **175+ 张**（v2.1 新增 5 黑点 + 20 球星对比） |
| 短梗 / 别名 / 黑称映射 | **500+ 条** |
| 争议分类 | **46 类** |
| 深度素材卡 | **10 张**（含 events / data / causes / background / analysis 五维结构） |
| 独立页面 | **8 个**（home / about / quiz / easter / privacy / history / favorites / onboarding） |
| 自动化测试 | **8 个**（CI 5 + utils 单元 3） |

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

### 完全本地化
- 无后端，无数据库依赖
- 本地匹配 + 别名表 + fallback 三级回退
- 反驳卡 / 别名 / 分类全部打包进小程序，离线可用

### 可选 AI 增强
- CloudBase 云函数 `generateReply`
- 接 DeepSeek v4-flash
- 任何失败（key 缺失 / 网络 / 限流 / 超时）都自动 fallback 到本地卡
- 用户感知零差异

### 零新依赖
- 原生微信小程序 + TDesign Mini-Program
- 无 Taro / 无 uni-app / 无 webpack / 无 vite
- 无构建步骤，导入即跑

### 测试覆盖
- 8 个自动化测试
- GitHub Actions CI 跑 5 个核心
- syntax / match / corpus / fallback / progression / safety / feedback / matchquery

### devils-advocate 自审
- **19/20+ PASS**（含安全 / 性能 / 架构 / 内容合规四维）
- 每次大版本完成后强制跑一遍 `/devils-advocate:critique`
- 失败项必须修或文档化为已知限制

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

> 詹黑逻辑拆解器：微信小程序，把评论区黑 LeBron 的话术（"8 分释兵权""Excel 球王""米奇冠军"）拆成结构化反驳卡。175 张本地反驳卡，559 条别名匹配。零新依赖，原生小程序 + TDesign。GitHub: github.com/clavelinaswykoniki-cell/LeBron

### 微博（140 字以内）

> 詹黑逻辑拆解器：一个把 LeBron 詹黑话术拆成结构化反驳的微信小程序。输入黑点 → 自动匹配反驳卡 → 一键复制怼回去。175 张反驳卡 / 559 别名 / 46 分类。练手项目，GitHub 开源。

### 即刻 / 朋友圈

> 上周末练手做的微信小程序：詹黑逻辑拆解器 🎯
>
> 痛点：评论区 LeBron 的黑点千篇一律（"8 分释兵权""Excel 球王""米奇冠军""科比五冠"）。每次都要打字回怼太累。
>
> 解法：把这些黑点全做成结构化反驳卡（短刀 / 封口 / 长拆 / 口播 4 种模式），输入秒出，一键复制。
>
> 数据：175 反驳卡 / 559 别名 / 46 分类 / 8 测试 / GitHub Actions CI。
>
> 技术：原生小程序 + TDesign，零新依赖。可选 AI 增强（DeepSeek）。
>
> GitHub: github.com/clavelinaswykoniki-cell/LeBron
