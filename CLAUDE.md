# LeBron Rebuttal Miniapp

## Scope

This project is a standalone WeChat mini-program for rebutting common anti-LeBron arguments.

Do not mix this project with:
- `../model-agent-ultra-station`
- Python orchestration backend work
- unrelated Second Brain / SaaS planning
- previous multi-agent / orchestration runtime discussions

## Product Intent

This is not a generic LeBron praise app.

It is a:
- black-point matcher
- logic teardown tool
- rebuttal phrase generator
- optional AI-enhanced argument assistant
- PK 段位对抗系统（段位排行 + 每日签到）

Priority is:
- accurate category matching
- strong short-form rebuttal
- stable local fallback
- safe CloudBase handoff for AI enhancement
- 后端：微信云托管 + MySQL（v2.6+ 已上线，wx.cloud.callContainer 直连）

## Current Structure

- `miniprogram/data/`: cards, aliases, categories, corpus, extended
- `miniprogram/utils/`: normalize, match, llm provider, prompt builder, duel, daily, safety
- `miniprogram/pages/`: 14 pages (index, result, about, easter, quiz, privacy, history, favorites, onboarding, leaderboard, pk, daily, chat, meme)
- `cloudfunctions/generateReply/`: 旧 CloudBase 云函数（v2.6+ 已被后端 `/api/llm/enhance` 替代，保留作 fallback）
- `scripts/`: syntax, match, corpus, fallback, duel tests
- `server/`: 后端（Node.js + Express + mysql2），跑在微信云托管，见下方「Server / 微信云托管」
- `docs/context-compact.md`: short current-state handoff for future agents

## Current Constraints

- Keep edits inside `lebron-rebuttal-miniapp` only
- Do not touch backend projects outside this directory
- Real API keys / passwords / AccessKey must NEVER be committed or sent to chat
- `.env` files are gitignored — credentials only live in local `.env` and 微信云托管环境变量
- CloudBase failure must always fall back to local cards
- Black terms can be used as aliases, not as proactive abusive output
- Start from `docs/context-compact.md` before reading large data files

## Current Baseline (v2.10.1 — 提交微信审核中 2026-05-20)

- 215 local rebuttal cards (base 100 + extra 7 + docx 50 + v2.1 15 + stars 15 + starsV2a/b 15+6 + legends 7)
- 730 aliases
- 67 extended card details (5 sources merged in arsenal.js)
- 14 pages registered in app.json（含 v2.6+ 新增 chat 和 meme）
- local matching working
- AI enhance：v2.10 起走 `wx.cloud.callContainer → /api/llm/enhance → DeepSeek V4 Flash`，CloudBase 云函数作为 legacy fallback 保留
- PK 段位 / leaderboard / daily check-in：前端 + 后端全链路通，数据走云托管 MySQL（4 张表事务）

## Commands

```bash
cd "/Users/happytang/Documents/New project/lebron-rebuttal-miniapp"
npm run check:syntax
npm run test:match
npm run test:corpus
npm run test:ai-fallback
```

Server commands:
```bash
cd server
npm run test:connect   # 验证 MySQL 连接（先填 .env 的 MYSQL_*）
npm start              # 本地启动 Express（默认端口 80，云托管要求）
```

## Server / 微信云托管（v2.6 上线 / v2.10 切 callContainer）

### 当前架构

- **运行环境**：微信云托管（Cloud Run），服务名 `express-fjva`，环境 ID `prod-d1go3yaske515bdb7`
- **数据库**：云托管内置 MySQL（`mysql2/promise` pool，utf8mb4），通过 `MYSQL_ADDRESS=host:port` 环境变量注入
- **前端调用**：v2.10 起 `wx.cloud.callContainer` 优先，`wx.request` HTTPS fallback 仅用于 Node 单测 / 开发者工具 mock / `forceHttp` 调试
- **DeepSeek**：通过后端 `/api/llm/enhance` 代理调用，key 锁在云托管环境变量
- **CloudBase 云函数**（`cloudfunctions/generateReply/`）：v2.6 起被 HTTP API 替代，作为 legacy fallback 保留

### API 端点（5 个）

| 路由 | 方法 | 文件 |
|---|---|---|
| `/api/leaderboard` | GET | `server/routes/leaderboard.js` |
| `/api/pk/submit` | POST | `server/routes/pk.js`（事务：UPSERT user + leaderboard + match_records） |
| `/api/daily/checkin` | POST | `server/routes/daily.js`（同日去重 + streak 累计） |
| `/api/llm/enhance` | POST | `server/routes/llm.js`（DeepSeek V4 Flash 代理 + 对抗 prompt） |
| `/api/chat/*` | POST | `server/routes/chat.js`（v2.9 新增 chat 模式） |

### 数据库（4 张 MySQL 表）

`users` / `leaderboard` / `match_records` / `checkins`，schema 见 `server/sql/001_init.sql`（`CREATE TABLE IF NOT EXISTS`，幂等可重复执行）。`.env` 模板见 `server/.env.example`。

### 段位 enum（前后端必须一致）

| 阈值 | id | name |
|---|---|---|
| 0 | bronze | 青铜詹蜜 |
| 200 | silver | 白银詹蜜 |
| 500 | gold | 黄金詹蜜 |
| 1000 | diamond | 钻石詹蜜 |
| 1800 | king | 王者詹皇 |

前端权威定义：`miniprogram/utils/duel.js`、`miniprogram/utils/progression.js`；后端：`server/db.js:RANK_TIERS` + `server/sql/001_init.sql` 的 CHECK 约束。任何一处改动跑 `.claude/skills/rank-tier-sync` 核对 5 个权威点。

### 已知泄露凭证（用户已决定继续使用，agent 不要再主动提醒 rotate）

**2026-05-19 用户明确决定**：免费个人测试项目，接受继续使用现密码。Agent 不要再主动建议 rotate 或唠叨安全风险。如果用户**自己**说要 rotate，再走 `/secret-rotate` skill。

1. `DEEPSEEK_API_KEY` = `<redacted-in-local-env>`（云托管环境变量 + 本地 `server/.env`）
2. 旧 `PG_PASSWORD` 曾在阿里云 RDS 时期泄露过；v2.6 已切换到云托管 MySQL，PG 资源**已废弃**，但旧密码若在 `~/.claude.json` postgres MCP 配置里仍残留，需要时由用户自行清理
3. 残留泄露文件 `server/lebron rds` 和 `server/.env.save` 含旧明文密码（已 gitignored，但本地仍存在）

### 下一步操作（给 Claude Code CLI）

当用户说「继续后端」或「跑后端联调」时，按此顺序：

1. 确认 `server/.env` 里 `MYSQL_*` + `DEEPSEEK_API_KEY` 是否已填
2. 跑 `cd server && npm run test:connect`（验证 MySQL 连接）
3. 如果连接成功但没表 → 提示用户在云托管 MySQL 管理界面粘贴 `server/sql/001_init.sql`
4. 如果跑 smoke：`./server/test-api.sh`（9 步基础回归，`--include-llm` 跑真实 DeepSeek 联调消耗 token）
5. **绝不要让用户把密码/AccessKey 发到对话里**

### 历史背景（v2.6 之前，已废弃）

v2.5 及之前曾计划部署到阿里云 ECS + RDS PostgreSQL（含 ICP 备案、Nginx、PM2、certbot）。v2.6 直接迁到微信云托管后，阿里云资源全部弃用，PostgreSQL 相关代码（`pg` driver / `PG_*` 环境变量）已移除。如在仓库或老 doc 里看到 ECS / RDS / PG / 备案 字样，那是旧记录，以本节为准。

## v2.10 云调用约束（重要）

- `wx.cloud.callContainer` 要求基础库 ≥2.13.0（微信 ≥7.0.0），覆盖 99%+ 活跃用户但**不是 100%**。
- `utils/api.js` 在云调用不可用时 fallback 到 `wx.request` + `DEFAULT_BASE_URL = *.sh.run.tcloudbase.com`，但**这个 URL 在生产环境被微信拒收**——所以 fallback 路径仅适用于：
  1. Node 单测（无 wx 对象）
  2. 开发者工具内的本地 mock
  3. `opts.forceHttp` 显式切换
- 真实生产用户基础库 <2.13.0 时，console.warn 提示用户升级微信；UI 层没有 modal 弹窗（避免每次启动都骚扰）。
- 后端 `server/server.js` 用 `cors()` 默认配置——`callContainer` 不发 Origin 头，CORS 中间件 no-op 通过，不影响 Express 路由匹配。
- 文件位置：`miniprogram/app.js`（`wx.cloud.init`），`miniprogram/utils/api.js`（双模式 dispatcher）
- 测试：`npm run test:api-cloud`（8/8 mock 覆盖 cloud-mode 契约）

## 首页 UI P0/P1 复盘（2026-05-18 审查后）

8 项中 7 项实际已在代码里完成，仅 1 项故意保留：

| # | 项 | 状态 | 备注 |
|---|---|---|---|
| 1 | 结果卡 3 段折叠 | ❌ **故意不做** | portfolio 截图希望展示多内容 |
| 2 | mood tab 文案「封口/长拆/口播」 | ✅ | index.wxml:211-214 |
| 3 | hero 字号 | ✅ | 标题 42rpx + 球衣 56rpx（不压标题） |
| 4 | 按钮 ≥64rpx + 无硬编码 360rpx | ✅ | 普遍 72rpx |
| 5 | 空 query empty-state | ✅ | index.wxml:303 |
| 6 | copy 加 vibrateShort | ✅ | index.js:124 |
| 7 | logic-label 湖人金 | ✅ | #fde68a，index.wxss:471 |
| 8 | .gitignore node_modules | ✅ | |

## Collaboration Contract

- treat this as a separate product sandbox
- avoid dragging in orchestration-system context unless explicitly requested
- prefer small, testable UI/data changes over broad architectural rewrites
- when asked to continue this project, summarize changed files, tests, and push status
- **never ask user to send passwords / AccessKey / secrets in chat — credentials belong in .env only**
