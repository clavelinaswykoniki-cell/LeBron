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
- 后端接入阿里云 ECS + RDS PostgreSQL（进行中）

## Current Structure

- `miniprogram/data/`: cards, aliases, categories, corpus, extended
- `miniprogram/utils/`: normalize, match, llm provider, prompt builder, duel, daily, safety
- `miniprogram/pages/`: 12 pages (index, result, about, easter, quiz, privacy, history, favorites, onboarding, leaderboard, pk, daily)
- `cloudfunctions/generateReply/`: CloudBase AI enhance path
- `scripts/`: syntax, match, corpus, fallback, duel tests
- `server/`: 后端 API 骨架（Node.js + Express + pg），见下方「Server / RDS 接入」
- `docs/context-compact.md`: short current-state handoff for future agents

## Current Constraints

- Keep edits inside `lebron-rebuttal-miniapp` only
- Do not touch backend projects outside this directory
- Real API keys / passwords / AccessKey must NEVER be committed or sent to chat
- `.env` files are gitignored — credentials only live in local `.env` and ECS server
- CloudBase failure must always fall back to local cards
- Black terms can be used as aliases, not as proactive abusive output
- Start from `docs/context-compact.md` before reading large data files

## Current Baseline (v2.5)

- 215 local rebuttal cards (base 100 + extra 7 + docx 50 + v2.1 15 + stars 15 + starsV2a/b 15+6 + legends 7)
- 730 aliases
- 67 extended card details (5 sources merged in arsenal.js)
- 12 pages registered in app.json
- local matching working
- AI enhance path scaffolded
- PK 段位 / leaderboard / daily check-in pages built (mock data, pending backend)

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
npm run test:connect   # 验证 RDS 连接（需要先填 .env）
npm start              # 启动 Express API（备案后用）
```

## Server / RDS 接入（v2.6 已完成本地链路）

### 进度

| 步骤 | 状态 |
|---|---|
| server/ 目录骨架 (server.js, db.js, routes/, sql/001_init.sql) | ✅ |
| server/ 依赖（express, pg, cors, dotenv） | ✅ |
| .gitignore 加 .env / .env.save / lebron rds 保护 | ✅ |
| server/.env 填 PG_* + DEEPSEEK_* | ✅（PG_PASSWORD + DEEPSEEK_API_KEY 都已泄露过，需 rotate） |
| `npm run test:connect` 连接验证 | ✅（PG 18.3） |
| 执行 sql/001_init.sql 建 4 张表 + seed | ✅（users / leaderboard / match_records / checkins） |
| SQL schema 对齐前端：`platinum` → `diamond` | ✅ |
| Express API skeleton (server.js + db.js + 段位 helper) | ✅ |
| `GET /api/leaderboard` | ✅ |
| `POST /api/pk/submit`（事务，UPSERT user + leaderboard + match_records） | ✅ |
| `POST /api/daily/checkin`（同日去重 + streak 累计） | ✅ |
| `POST /api/llm/enhance`（DeepSeek 代理，移植 cloudfunctions/generateReply） | ✅ 代码完，等真实 model ID 跑真实联调 |
| 后端 10/10 smoke test | ✅（详见 server/test-api.sh） |
| 前端 utils/api.js（wx.request 封装 + 超时 + 降级） | ✅ |
| 前端 utils/userProfile.js（伪 openid + nickname/avatar 存取） | ✅ |
| 前端 duel.js: fetchLeaderboard async + submitMatch fire-and-forget | ✅ |
| 前端 leaderboard 页面：loading + error + fromServer 提示 | ✅ |
| 前端 llmProvider.js 从 CloudBase 切到 HTTP /api/llm/enhance | ✅ |
| 买域名 (.cn ~30 元) + ICP 备案 | ❌ **等用户**，备案 7-20 天 |
| ECS 装环境 (Node 18 / Nginx / PM2 / certbot) | ⏳ 等备案 |
| 真机扫码 + HTTPS | ⏳ 等备案 |
| onboarding 加 step 5 选头像/昵称 | ⏳ Day 2 |
| 梗图工厂 + 段位升级动画 | ⏳ Day 3-4 |
| 录 demo + 写 README/PORTFOLIO_HIGHLIGHTS | ⏳ Day 13 |

### 已知泄露凭证（用户已决定继续使用，agent 不要再主动提醒 rotate）

**2026-05-19 用户明确决定**：免费个人测试项目，接受继续使用现密码。Agent 不要再主动建议 rotate 或唠叨安全风险。如果用户**自己**说要 rotate，再走 `/secret-rotate` skill。

1. `PG_PASSWORD` = `<redacted-in-local-env>`（也存在于 `~/.claude.json` 的 postgres MCP 配置里）
2. `DEEPSEEK_API_KEY` = `<redacted-in-local-env>`
3. 残留泄露文件 `server/lebron rds` 和 `server/.env.save` 含明文密码

### 段位 enum（前后端必须一致）

| 阈值 | id | name |
|---|---|---|
| 0 | bronze | 青铜詹蜜 |
| 200 | silver | 白银詹蜜 |
| 500 | gold | 黄金詹蜜 |
| 1000 | diamond | 钻石詹蜜 |
| 1800 | king | 王者詹皇 |

前端权威定义：`miniprogram/utils/duel.js:25` 和 `progression.js:20`；后端：`server/db.js:RANK_TIERS` + `001_init.sql` CHECK 约束。

### 阿里云资源

- **ECS**: 39.107.192.89（纯净，未装任何环境）
- **RDS PostgreSQL 外网**: `pgm-bp185z0tt2z005n7mo.pg.rds.aliyuncs.com:5432`
- **RDS PostgreSQL 内网**: `pgm-bp185z0tt2z005n7.pg.rds.aliyuncs.com:5432`（上 ECS 后用这个）
- **RDS 账号**: `lebron_api` / 数据库: `lebron`
- **VPC**: vpc-bp1gv05b26tfv6mkhuwxg, 网段 172.16.0.0/12

### 下一步操作（给 Claude Code CLI）

当用户说「继续接 RDS」或「继续后端」时，按此顺序：

1. 确认 `server/.env` 里 PG_PASSWORD 是否已填（不是 `__FILL_YOUR_PASSWORD_HERE__`）
2. 跑 `cd server && npm run test:connect`
3. 如果连接成功但没表 → 提示用户用 GUI 执行 `server/sql/001_init.sql`
4. 如果连接成功且有表 → 开始写 Express API 路由
5. **绝不要让用户把密码/AccessKey 发到对话里**

### 数据库表结构 (server/sql/001_init.sql)

4 张表：`users`, `leaderboard`, `match_records`, `checkins`
详见 `server/sql/001_init.sql`，全部 `CREATE TABLE IF NOT EXISTS`，幂等可重复执行。

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
