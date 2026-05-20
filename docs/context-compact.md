# LeBron Miniapp Compact Context

> 给新 agent 的 fast onboarding。读完这一页再去看 `CLAUDE.md` 细节。

## Project Boundary

This is the LeBron rebuttal miniapp only.

Do not load or discuss:
- `../model-agent-ultra-station`
- multi-agent runtime / orchestration experiments
- Second Brain infrastructure
- other backend projects

Only work inside:

```text
/Users/happytang/Documents/New project/lebron-rebuttal-miniapp
```

## Current Status (v2.10.1)

- 已提交微信小程序审核（2026-05-20，预计 1-3 天出结果）
- `main @ 116512a`，working tree clean，已 push 到 `origin/main`
- **审核中红线：不改代码、不动 cloudfunctions/、server/.env、node_modules、utils/api.js、app.js**

## Current Stack

```
微信小程序（原生 + TDesign）
  ↓ wx.cloud.callContainer（v2.10+ 优先；wx.request HTTPS 作 fallback）
Express on 微信云托管（服务名 express-fjva / 环境 prod-d1go3yaske515bdb7）
  ├─ mysql2 pool → 云托管 MySQL（4 张表事务）
  └─ HTTPS → DeepSeek V4 Flash（key 后端代理）
```

- AI 增强走自家 `/api/llm/enhance` 代理，**DeepSeek API key 永远不出现在前端**
- CloudBase 云函数（`cloudfunctions/generateReply/`）v2.6 起已被 HTTP API 替代，保留作 legacy fallback
- 所有网络调用都有本地兜底（用户感知是「网络慢」，不是「崩了」）

## Data Baseline

- **215** 反驳卡（base 100 + extra 7 + docx 50 + v2.1 15 + stars 15 + starsV2a/b 15+6 + legends 7）
- **730** aliases
- **46** 分类
- 67 extended card details (5 sources merged in `arsenal.js`)
- `review_needed` corpus entries must not enter matching

## Page & API Topology

- **14 pages**：index, result, about, easter, quiz, privacy, history, favorites, onboarding, leaderboard, pk, daily, chat, meme
- **5 API endpoints**：`GET /api/leaderboard` / `POST /api/pk/submit` / `POST /api/daily/checkin` / `POST /api/llm/enhance` / `POST /api/chat/*`
- **4 MySQL tables**：`users` / `leaderboard` / `match_records` / `checkins`（schema in `server/sql/001_init.sql`）

## Important Files

```text
miniprogram/data/                 # 215 cards + 730 aliases 入口
  ├── arsenal.js                  # 统一数据合并入口
  ├── categories.js
  ├── aliases*.js                 # 4 个别名文件
  └── rebuttal_cards*.js          # 13 个卡片文件（合并 base/extra/docx/v2_1/stars/legends）

miniprogram/utils/
  ├── matchQuery.js               # 本地匹配 + fallback
  ├── normalizeQuery.js           # 用户输入归一化
  ├── api.js                      # v2.10 双模式 dispatcher（cloud / wx.request）
  ├── duel.js                     # PK + 段位权威定义
  ├── progression.js              # 段位升级 + 勋章
  ├── promptBuilder.js            # AI prompt 组装
  ├── llmProvider.js              # v2.10 起调 /api/llm/enhance
  ├── safety.js                   # 错误兜底 + UI 安全
  └── feedback.js                 # 触感反馈

server/
  ├── server.js                   # Express 入口（dotenv + cors + 路由挂载）
  ├── db.js                       # mysql2 pool + RANK_TIERS（段位权威镜像）
  ├── routes/                     # leaderboard / pk / daily / llm / chat
  ├── sql/001_init.sql            # MySQL 幂等 schema + seed
  └── test-api.sh                 # 9 步 curl smoke

cloudfunctions/generateReply/     # legacy CloudBase fallback（v2.6+ 已被替代）

scripts/                          # 12 个 npm scripts 测试
docs/PROMPT_VERSIONS.md           # v2.8 → v2.8.5 prompt 6 版迭代记录
docs/BUG_REPORT_20260519.md       # 历史审计（READ-ONLY）
```

## Test Commands

```bash
npm run check:syntax              # 静态检查 + UI 契约
npm run test:match                # 50 高频黑点 → 卡命中
npm run test:corpus               # 语料完整性 + review_needed 校验
npm run test:ai-fallback          # AI enhance 三态：missing / failure / success
npm run test:progression          # 段位升级 / 勋章
npm run test:safety               # safety.js
npm run test:feedback             # feedback.js
npm run test:matchquery           # matchQuery.js
npm run test:storage              # wx.storage 封装
npm run test:duel                 # duel.js
npm run test:prompt               # 对抗 prompt dry-run（不烧 token）
npm run test:api-cloud            # cloud-mode 契约（8/8）
```

Server smoke：`cd server && ./test-api.sh`（9 步基础回归；`--include-llm` 跑真实 DeepSeek 消耗 token）。

GitHub Actions 每次 push / PR 自动跑前端测试。

## 段位 enum（前后端必须一致）

| 阈值 | id | name |
|---|---|---|
| 0 | bronze | 青铜詹蜜 |
| 200 | silver | 白银詹蜜 |
| 500 | gold | 黄金詹蜜 |
| 1000 | diamond | 钻石詹蜜 |
| 1800 | king | 王者詹皇 |

权威源：`utils/duel.js`、`utils/progression.js`、`server/db.js:RANK_TIERS`、`server/sql/001_init.sql` CHECK 约束。改任何一处先跑 `.claude/skills/rank-tier-sync` 核对。

## 已知约定（important）

- **凭证不主动 rotate**：用户 2026-05-19 明确决定不动 `DEEPSEEK_API_KEY`，仅在用户**自己**说要换时走 `/secret-rotate` skill
- **API key 永不进前端**：DeepSeek、MySQL 密码全部锁在云托管环境变量
- **never paste passwords / AccessKey in chat**：`.env` 是唯一存放地
- **CloudBase fallback 必须始终能跑**：哪怕 HTTP API 全挂，离线 215 卡兜底要稳

## Good Next Tasks（审核通过/失败后才动代码）

审核期间只动文档 / 非代码改动。审核结果出来后：
- 审核通过 → 录 demo + 内测扫码 + 简历挂链
- 审核驳回 → 看驳回原因（合规 / 内容 / 隐私 / 备案）按条修复

候选改动（v2.11 候选）：
- onboarding step 5：选头像 + 昵称（用户已有方向）
- 梗图工厂深化 + 段位升级动画
- 已完成功能截图 → `docs/screenshots/`，补 README 截图行
- 写 demo 录制脚本 + 简历项目链接

## Standard Prompt For Future Work

```text
继续 LeBron 小程序。

本地目录：
/Users/happytang/Documents/New project/lebron-rebuttal-miniapp

这次目标：
[写清楚一个小目标]

约束：
- 只改 lebron-rebuttal-miniapp，不碰 ../model-agent-ultra-station
- 不动 cloudfunctions/、server/.env、node_modules、utils/api.js、app.js（除非明确允许）
- 不提交真实 API Key
- 改任何段位阈值要跑 .claude/skills/rank-tier-sync
- 做完跑相关 npm run test:* 子集
- 最后报：changed files、test results、是否要 push
```
