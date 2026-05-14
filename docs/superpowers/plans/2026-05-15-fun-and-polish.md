# LeBron 小程序 · 娱乐 + 完善扩展 Plan

> **创建**：2026-05-15
> **来源**：Step 1 brainstorming（18 娱乐 + 14 完善候选 → 选 5+5）
> **执行**：Step 3 派 5 个 subagent 并行（worktree isolation）

---

## 项目背景

- 路径：`/Users/happytang/Documents/New project/lebron-rebuttal-miniapp`
- 技术栈：微信小程序 wxml + wxss + TDesign + 原生 JS
- 当前 baseline：150 卡 / 441 别名，4/4 测试通过
- 目标：练手项目 + 作品集；好玩 + 完善

## 硬约束

1. 只改 `lebron-rebuttal-miniapp` 目录
2. 不接 CloudBase / 不引入新框架
3. 不提交真实 API key
4. 黑称只做 alias，不主动输出
5. 微信审核合规
6. 保留所有现有测试通过

---

## 任务总览

### 娱乐功能（5 个）

| ID | 名称 | 复杂度 | 好玩 | 文件影响 | 并行 Agent |
|---|---|---|---|---|---|
| E01 | 复制爽感包（音效 + 金光 + 震动） | 2 | 5 | `index.js` + 新建 `utils/feedback.js` + 新 audio assets | **Agent A** |
| E07 | 23 号彩蛋（长按球衣触发） | 1 | 4 | `index.wxml` + `index.js` + 彩蛋页 | **Agent B** |
| E02 | 球迷段位系统（青铜→王者） | 3 | 5 | 新建 `utils/progression.js` + 关于页 | **Agent C** |
| E10 | 进度勋章（依赖 E02） | 3 | 4 | 同 Agent C（合并任务） | **Agent C** |
| E11 | 球迷测试 H5（5 题判断段位） | 4 | 5 | 新建 `pages/quiz/` | **Agent D** |

### 完善功能（5 个）

| ID | 名称 | 复杂度 | 工作量 | 文件影响 | 并行 Agent |
|---|---|---|---|---|---|
| P05 | 隐私协议页 | 1 | 0.5h | 新建 `pages/privacy/` | **Agent E** |
| P04 | 关于页（顺手） | 1 | 1h | 新建 `pages/about/`（含 E02 段位展示） | **Agent C** |
| P08 | 错误处理 + 空状态完善 | 2 | 1h | `index.wxml`/`index.js` 兜底 | **Agent E** |
| P01 | README 重写 | 1 | 2h | `README.md` | **主 Claude 收尾**（依赖功能完成）|
| P02 | 截图指南 + 演示脚本 | 1 | 1h | `docs/SCREENSHOT_GUIDE.md` + `docs/DEMO_SCRIPT.md` | **主 Claude 收尾** |

---

## 优先级 + 依赖

```
P0 (必做，相互独立):
  - Agent A: E01 复制爽感
  - Agent B: E07 23 号彩蛋
  - Agent E: P05 隐私页 + P08 错误处理

P1 (建议做，有内部依赖):
  - Agent C: E02 段位 + E10 勋章 + P04 关于页（三合一）
  - Agent D: E11 球迷测试 H5（新页面，独立）

P2 (收尾，依赖前面完成):
  - 主 Claude: P01 README 重写
  - 主 Claude: P02 截图指南 + 演示脚本
```

**关键依赖**：
- E10 勋章 依赖 E02 段位 → 同一个 Agent C 内串行
- P04 关于页 依赖 E02 段位（展示用户段位）→ 同一个 Agent C
- P01 README + P02 截图 依赖**所有功能完成** → 主 Claude 最后做

---

## 并行 Agent 分工（worktree 隔离）

### Agent A: 复制爽感包（E01）

**Worktree**：`/Users/happytang/Documents/New project/lebron-rebuttal-miniapp-agent-a`
**Branch**：`agent-a/copy-feedback`
**单一职责**：增强复制反馈

**改动范围**：
- `miniprogram/pages/index/index.js`：扩展 `copyToClipboard` 函数
- 新建 `miniprogram/utils/feedback.js`：抽取通用反馈逻辑（震动 + 音效 + 视觉）
- 新建 `miniprogram/assets/sounds/`：放 1-2 个 < 50KB 的 CC0 短音效（投篮入网 / 爽快短音）
  - **找不到合规音效就跳过音效部分**，只做震动 + 视觉
- `index.wxss`：加 `@keyframes goldFlash` 一闪而过的金光叠加层

**验收标准**：
1. 复制后立即触发：震动（light）+ Toast "已复制" + 金光特效 800ms 内消失
2. 音效（如有）音量 < 50%，可在 `feedback.js` 里关
3. 复制空内容时不触发反馈（保留现有 "没有可复制内容" Toast）
4. 4 个测试全过
5. 不破坏已有 7 个复制按钮的功能

**回滚**：删 `utils/feedback.js`，恢复 `copyToClipboard` 原版。

---

### Agent B: 23 号彩蛋（E07）

**Worktree**：`/Users/happytang/Documents/New project/lebron-rebuttal-miniapp-agent-b`
**Branch**：`agent-b/jersey-easter-egg`
**单一职责**：jersey-num 长按 3 秒触发彩蛋

**改动范围**：
- `miniprogram/pages/index/index.wxml`：jersey-card 加 `bindlongpress="onJerseyLongPress"`
- `miniprogram/pages/index/index.js`：新增 `onJerseyLongPress` 方法
- 新建 `miniprogram/pages/easter/`（egg 页面）：展示一句"历史第一人"宣言 + 23 号大图 + 关闭按钮
- 在 `app.json` 注册新页面

**彩蛋内容（必须）**：
- 大字："Strive for Greatness"
- 中字：詹姆斯生涯里程碑（4 冠 / 4 FMVP / 4 MVP / 历史得分王 / 41 岁仍 25+）
- **不含任何辱骂 / 阵营对立内容**
- 底部 "回家" 按钮

**验收标准**：
1. 长按 jersey-num 800ms 触发跳转
2. 短按不触发（避免误触）
3. 彩蛋页能正常关闭返回
4. 4 个测试全过

**回滚**：删 `pages/easter/`，从 `app.json` 移除，删 wxml/js 改动。

---

### Agent C: 段位 + 勋章 + 关于页（E02 + E10 + P04）

**Worktree**：`/Users/happytang/Documents/New project/lebron-rebuttal-miniapp-agent-c`
**Branch**：`agent-c/progression-and-about`
**单一职责**：游戏化进度系统 + 关于页

**改动范围**：
- 新建 `miniprogram/utils/progression.js`：
  - 段位定义：`[青铜詹蜜, 白银詹蜜, 黄金詹蜜, 钻石詹蜜, 王者詹蜜]`
  - 每个段位阈值（按累计阅读卡数）：`[0, 10, 30, 80, 150]`
  - 勋章列表：`[首次阅读, 阅读10张, 阅读50张, 阅读全部分类, 首次复制, 复制 50 次]`
  - localStorage key: `lbr_progression`
  - 接口：`recordCardView(cardId)` / `recordCopy()` / `getCurrentRank()` / `getEarnedBadges()`
- `miniprogram/pages/index/index.js`：搜索结果生成时调用 `recordCardView`，复制时调用 `recordCopy`
- 新建 `miniprogram/pages/about/`：
  - 显示当前段位 + 勋章墙
  - 项目信息（150 张卡 / 441 别名 / 30 分类）
  - 作者 / 致谢 / 免责声明
  - 在 `app.json` 注册
- `miniprogram/pages/index/index.wxml`：hero-stats 加 "我的段位：xx" 入口，点击跳转关于页

**验收标准**：
1. localStorage 持久化（小程序重启段位不丢）
2. 阅读 10 张卡升白银，30 张升黄金（手动可验证）
3. 勋章达成时弹 Toast "🏆 解锁勋章：xxx"
4. 关于页能正确显示段位 + 勋章
5. 4 个测试全过 + 不破坏现有 hero-stats 视觉

**回滚**：删 `utils/progression.js` + `pages/about/`，恢复 `index.js`。

---

### Agent D: 球迷测试 H5（E11）

**Worktree**：`/Users/happytang/Documents/New project/lebron-rebuttal-miniapp-agent-d`
**Branch**：`agent-d/fan-quiz`
**单一职责**：5 题测试页

**改动范围**：
- 新建 `miniprogram/pages/quiz/`：
  - `quiz.js`：5 道题数据 + 答题逻辑 + 评分（每题选项有蜜/黑/中立倾向，最后给"X 级詹蜜"或"X 级詹黑"或"中立观察者"）
  - `quiz.wxml`：单题展示 / 进度条 / 选项 / 结果页
  - `quiz.wxss`：紫金主题
- 题目内容（**必须**）：
  - 5 题围绕"你对詹姆斯的态度"
  - 选项无侮辱性、无敏感词
  - 例题："2011 年 8 分释兵权你怎么看？" → 选项：A. 实力不够（黑）B. 战术错位（蜜）C. 我不太了解（中立）
- 在 `app.json` 注册新页面
- 首页加入口（hero-stats 或单独 chip）

**验收标准**：
1. 5 题答完显示结果（"X 级詹蜜" 或类似中性标签）
2. 可重答
3. 结果页有 "复制结果" 按钮
4. 4 个测试全过

**回滚**：删 `pages/quiz/`，从 `app.json` 移除，删首页入口。

---

### Agent E: 隐私页 + 错误处理（P05 + P08）

**Worktree**：`/Users/happytang/Documents/New project/lebron-rebuttal-miniapp-agent-e`
**Branch**：`agent-e/privacy-and-error`
**单一职责**：合规页 + 边界 UX

**改动范围**：
- 新建 `miniprogram/pages/privacy/`：
  - 标准模板：本小程序不收集任何用户数据 / 段位记录仅本地存储 / 复制内容仅在客户端 / 等
  - 紫金主题，单页文本
- 在 `app.json` 注册
- `miniprogram/pages/index/index.js`：
  - `onGenerate` 空 query 时除了显示 empty-state，再加一个 Toast 提示 "先输入一个黑点"
  - `copyToClipboard` 失败兜底（catch + Toast "复制失败"）
  - AI 增强失败的 Toast 已存在，确认覆盖 success/fail 两种
- `miniprogram/pages/index/index.wxml`：empty-state 加跳转隐私页的小字链接

**验收标准**：
1. 隐私页能从首页底部进入
2. 空 query 点"生成反驳" 出现 Toast + empty-state
3. 复制空内容 / 网络失败 都有 Toast 提示
4. 4 个测试全过

**回滚**：删 `pages/privacy/`，恢复 `index.js` 改动。

---

## 主 Claude 收尾任务（依赖所有 Agent 完成）

### P01 README 重写

- 项目介绍（1 段）
- 技术栈
- 数据规模（150 卡 / 441 别名 / 30 分类）
- 功能清单（标注 v2.0 新增：段位 / 彩蛋 / 测试 H5 / 隐私页 / 错误处理）
- 跑通指南（git clone → 微信开发者工具）
- 截图位（占位等用户提供）
- 演示脚本入口

### P02 截图指南 + 演示脚本

- `docs/SCREENSHOT_GUIDE.md`：列出要截哪 6-8 张图（首页 / 段位 / 彩蛋 / 测试 / 关于 / 隐私 / 复制反馈 / 错误兜底）
- `docs/DEMO_SCRIPT.md`：30 秒演示稿，朋友问"做了什么"时按这个讲

---

## 回滚策略

**单 Agent 失败**：
- 该 worktree 不 merge 回 main
- 主 Claude 评估：跳过该功能 or 重新 dispatch agent

**多 Agent 冲突**：
- 按顺序 merge（A → B → E → C → D，C/D 最后因为新增页面较多）
- 冲突文件主要是 `app.json`（pages 数组）+ `index.wxml`（首页入口）
- 主 Claude 手动 resolve

**功能上线后破坏现有**：
- `git revert` 该 commit
- 跑测试验证恢复

---

## 验收终态

1. 所有 5 个 worktree 已 merge 到 main
2. 4 个测试通过（check:syntax / test:match / test:corpus / test:ai-fallback）
3. 新增 4 个页面（easter / about / quiz / privacy）在 `app.json` 注册
4. 新增 utils（feedback / progression）有基础注释
5. README 重写完
6. devils-advocate critique 全 PASS
7. 演示脚本就绪

---

## 不做的事（避免范围蔓延）

- ❌ E06 AI 黑哥对线（需要 CloudBase，违反硬约束）
- ❌ E04 战绩截图卡（含敏感词时审核风险）
- ❌ E12 名场面表情图（图片版权）
- ❌ E14 PK 投票模式（需要后端存投票数据）
- ❌ E17 皮肤包（视觉收益低，工作量大）
- ❌ P11 全测试覆盖（耗时，且当前测试已覆盖核心）
- ❌ P12 logo 设计（要专业设计能力，本次跳过）
- ❌ P14 GitHub Release（用户自己打 tag）
- ❌ 任何"改 150 张卡基础结构"的事
