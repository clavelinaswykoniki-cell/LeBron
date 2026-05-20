# LeBron 论点拆解器 · Portfolio Highlights

> 给招聘官 / 面试官的 90 秒概览。

---

## 一句话定位

我设计并实现了一个**全栈微信小程序**：客户端（小程序原生 + TDesign）+ REST API（Node/Express）+ 数据库（MySQL）+ AI 增强（DeepSeek V4 Flash，自有后端代理）+ 微信云托管部署，**一个人交付**。

围绕「篮球粉丝在评论区辩论」这个具体场景，215 张反驳卡片化 + PK 段位赛 + 排行榜 + 每日签到 + 梗图工厂 + 朋友圈分享。

---

## 技术栈速览

| 层 | 技术 | 关键决策 |
|---|---|---|
| 客户端 | WeChat MiniProgram 原生 | 不引 Taro/uni-app，保留对平台 API 的直接控制 |
| 客户端 UI | TDesign Mini-Program 1.14 | 用官方组件，但所有视觉走湖人紫金主题 wxss |
| 后端 | Node 18 + Express 4 | 没用 Nest/Koa 等重型框架——业务简单，过度抽象反伤可读性 |
| 数据库 | MySQL（微信云托管内置） | v2.6 从阿里云 RDS PostgreSQL 切到云托管 MySQL，换 7-20 天 ICP 备案为「同周上线」 |
| 客户端 ↔ 后端 | `wx.cloud.callContainer` | v2.10 起绕开正式域名 + ICP 备案 + HTTPS 白名单要求；fallback 仍保留 `wx.request` 供单测/调试 |
| AI 增强 | DeepSeek V4 Flash | 通过自家后端代理，**key 永远不出现在客户端**——portfolio 必答题 |
| 部署 | 微信云托管（Cloud Run） | 服务名 `express-fjva` / 环境 `prod-d1go3yaske515bdb7`；常驻 + 平台托管 SQL pool |
| CI/CD | GitHub Actions（matrix: Node 18 + 20） | 每次 push 自动跑 12 套前端测试 |

---

## 我亲手做的架构决策（看得到的工程思考）

### 1. 双路径策略：API 失败必须降级到本地

每个网络调用都接 `requestWithFallback(method, path, data, fallbackFn)`：
- `getLeaderboard` 失败 → 本地 100 个 mock 玩家
- `submitMatch` 调 API 是 fire-and-forget，本地 history 同步写入
- `enhance` AI 失败 → 返回本地反驳卡

**为什么**：小程序在地铁/电梯/弱网下是常态。让用户体感是「网络慢」而非「崩了」。完全离线 215 张本地卡 + 730 别名也能匹配出反驳。

**代码位置**：`miniprogram/utils/api.js:requestWithFallback`、`miniprogram/utils/duel.js:fetchLeaderboard`

---

### 2. 安全边界：DeepSeek API key 绝不进客户端

```
小程序 → wx.cloud.callContainer → POST /api/llm/enhance
                                  → 后端读 process.env.DEEPSEEK_API_KEY
                                  → DeepSeek V4 Flash
```

小程序代码 = 前端代码，反编译即可拿 key 刷余额。**面试官十次有八次会问这个**，所以从最早的 CloudBase scaffold 起就把 DeepSeek 调用放在服务端，v2.6 切到自有 Express 后保留同样的代理模式。

**代码位置**：`server/routes/llm.js`（移植自 `cloudfunctions/generateReply/index.js`，保留 prompt 流程不变）

---

### 3. 段位 schema 前后端对齐 + 5 处契约

前端 `duel.js` 定义 5 档段位 `bronze(0) / silver(200) / gold(500) / diamond(1000) / king(1800)`。

后端 `001_init.sql` 用 MySQL `CHECK` 约束（MySQL 8.0+ 才强制执行；早期版本只校验语法）。**第一次跑就发现 SQL 里写错 `platinum`**——前端字段写后端会被 CHECK 拒。

**修法**：把权威源放前端 `duel.js:RANK_TIERS`，后端 `db.js:RANK_TIERS` 是镜像；写了 `.claude/skills/rank-tier-sync` 一键核对 5 个权威点（`duel.js` / `progression.js` / `server/db.js` / `server/sql/001_init.sql` / `CLAUDE.md`）。任何阈值改动跑这个 skill 才能 merge。

**代码位置**：`miniprogram/utils/duel.js:RANK_TIERS`、`server/db.js:RANK_TIERS`、`server/sql/001_init.sql`

---

### 4. 事务设计：PK 提交的强一致

`POST /api/pk/submit` 在一个事务里做 4 件事：
1. UPSERT user（避免新用户先注册再 PK）
2. 读旧 leaderboard 段位（确定 `rank_before`）
3. UPSERT leaderboard（`score = GREATEST(old + delta, 0)`，`total_matches += 1`，`wins += isWin ? 1 : 0`）
4. INSERT match_records（流水表，追溯用）

**为什么**：用户连点提交可能造成竞态。事务 + `ON DUPLICATE KEY UPDATE` + 显式锁，三层防御。

**代码位置**：`server/routes/pk.js`

---

### 5. 工程纪律

- **测试**：12 个前端测试 + 9 步 curl smoke。`scripts/test-ai-enhance-fallback.js` 验证 LLM 三态（missing / failure / success），改架构必须先改测试再改实现
- **Prompt 工程**：v2.8 → v2.8.5 共 6 版迭代（详见 `docs/PROMPT_VERSIONS.md`），逐版加固：防侮辱性人身攻击 / 防编造精确数字 / 防金句模板化 / 防滑坡到主动黑别人 / 防 prompt injection。配 `scripts/test-prompt-adversarial.js` 离线 dry-run 10 类攻击面，不烧 DeepSeek token
- **安全**：`.gitignore` 多层防御（`.env / .env.* / *.rds / _quarantine/`），泄露文件隔离而不删除（保留可逆性）
- **协作约束**：项目根 `CLAUDE.md` + `docs/context-compact.md` 是 AI 协作硬约束（never paste passwords, never bypass fallback），等于人机 contract

---

## 数据规模

| 指标 | 数量 |
|---|---|
| 反驳卡 | 215 张（多源合并 + 去重） |
| 别名 / 短梗 | 730 条 |
| 争议分类 | 46 类 |
| 已实现页面 | 14 个（含 v2.9 chat / meme） |
| 后端表 | 4 张（users / leaderboard / match_records / checkins） |
| 后端 API | 5 个（leaderboard / pk/submit / daily/checkin / llm/enhance / chat） |
| 测试用例 | 前端 12 套 + 后端 9 步 smoke |
| Prompt 迭代 | v2.8 → v2.8.5 共 6 版（带对抗测试） |

---

## 实际能讲的故事（面试场景）

1. **「为什么从阿里云 ECS + RDS PostgreSQL 切到微信云托管 + MySQL？」**
   答：原方案需要 ICP 备案（7-20 天）+ 自己装 Nginx/PM2/certbot；云托管 + `callContainer` 同周上线、零备案、SQL pool 平台托管。我选了「先见用户」而不是「展示自己装环境」。这是诚实的取舍——portfolio 价值不如「能让用户扫码用」高。

2. **「`wx.cloud.callContainer` 跟 `wx.request` 有什么本质不同？」**
   答：`wx.request` 走公网 HTTPS，必须有备案域名 + 加入小程序后台白名单；`callContainer` 走微信内部信任链，靠云环境 ID + 服务名鉴权，不要求备案域名。代价：基础库 ≥2.13.0（覆盖 99%+ 用户但不是 100%）。我把它作为优先路径，`wx.request` 留作单测 / 开发者工具 mock / 显式 `forceHttp` 调试。

3. **「这个 schema drift（platinum）是怎么发现的？」**
   答：第一次跑 smoke test，`POST /api/pk/submit` 返回 500，看 MySQL 错误是 CHECK 违反。这种问题不写测试永远不知道——所以我的 smoke script 现在覆盖所有 5 个段位流转。后来还写了 `.claude/skills/rank-tier-sync` 把契约强制到 CI 流程外。

4. **「降级策略实际多有用？」**
   答：本地 emulator 关掉后端再跑一遍 PK 流程，UI 完全不报错——这是真实弱网体验。给面试官现场断网演示，所有功能（除了云端排行榜更新）正常。

5. **「prompt 怎么防绕过？」**
   答：v2.8 → v2.8.5 六版迭代，每版填一个真实事故的坑——AI 输出"脑残/瞎了"（v2.8.1 加禁止人身攻击）、AI 编造"49.2% 联盟前 3"无法验证数字（v2.8.2）、AI 同句式打四个 mood（v2.8.3）、AI 主动黑威少/杜兰特（v2.8.4）、用户问非篮球话题试图绕过（v2.8.5）。每次都写到 `docs/PROMPT_VERSIONS.md`，配 `test-prompt-adversarial.js` 10 类离线 dry-run。

---

## 项目主页

- **GitHub**: https://github.com/clavelinaswykoniki-cell/LeBron （CI badge 对外）
- **小程序体验**: v2.10.1 已提交微信审核（2026-05-20），通过后扫码即用，无需备案
- **架构图**: 见 `README.md` 顶部 mermaid

---

## 一句话总结（适合放简历）

> 全栈微信小程序「LeBron 论点拆解器」：215 卡 / 730 别名 / 14 页面 / 4 MySQL 表 / 5 API，Node + Express + DeepSeek V4 Flash，部署微信云托管（`wx.cloud.callContainer` 直连），12 套前端自动化测试 + GitHub Actions CI，单人交付。
