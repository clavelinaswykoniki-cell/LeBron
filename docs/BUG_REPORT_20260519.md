# Bug & 一致性扫描报告 — 2026-05-19

> READ-ONLY 全局扫描。无任何文件被修改。
> 扫描人：Claude Opus 4.7（senior 代码审查角色）

---

## P0 — 必须立即修复（直接挂 / 上线即崩）

- [ ] **server.js 没有加载 dotenv** — `server/server.js` 与所有 `server/routes/*.js`、`server/db.js` 都没调 `require("dotenv").config()`。结果：跑 `npm start` 时 `.env` 完全不生效。`db.js:33-35` 会落到默认值 `root` / 空密码 / `localhost:3306`，连不上 RDS；`DEEPSEEK_API_KEY` 读不到，`/api/llm/enhance` 永远返回 503。仅 `test-connect.js:12` 调了 dotenv，所以"测试通了 → 上线就挂"。**修复**：在 `server.js:14` 之前插 `require("dotenv").config()`。

- [ ] **server/.env 用了错的 env 前缀** — `server/.env:12-16` 全是 `PG_HOST / PG_PORT / PG_USER / PG_PASSWORD / PG_DATABASE`，但 `server/db.js:28-35` 读的是 `MYSQL_ADDRESS / MYSQL_USERNAME / MYSQL_PASSWORD / MYSQL_DATABASE`（前缀全错 + 字段名不一样，前者 `PG_HOST:PG_PORT` 分两个变量，后者要 `MYSQL_ADDRESS=host:port` 合一个）。即使加上 dotenv，这份 .env 一行都用不上。**修复**：要么把 `.env` 改成 `MYSQL_ADDRESS=host:port`/`MYSQL_USERNAME=...`，要么把 `db.js` 重写成 PG（用 pg 包，目前 package.json 只有 mysql2 没有 pg）。

- [ ] **server/.env.example 与代码不一致** — `server/.env.example` 用 `MYSQL_*`（与代码匹配），但实际 `server/.env`（用户填的那份）用 `PG_*`。任何新 dev `cp .env.example .env` 之后再"对着 RDS 控制台填"会写成 PG_* 风格，跑起来一样连不上。

- [ ] **DEEPSEEK_MODEL 默认值是假的 model ID** — `server/routes/llm.js:14` 与 `cloudfunctions/generateReply/index.js:8` 都默认 `deepseek-v4-flash`。DeepSeek 官方真实 model ID 是 `deepseek-chat` / `deepseek-reasoner`，根本没 `v4-flash` 这个 ID。结果 `/api/llm/enhance` 会被 DeepSeek 返回 400 `model not found`。chat.js 路由默认 `deepseek-chat`（对的），不一致。**修复**：把 llm.js + cloudfunctions 默认改成 `deepseek-chat`。

- [ ] **CLAUDE.md 整段"PostgreSQL"描述与代码矛盾** — `CLAUDE.md` 通篇说 "Node.js + Express + pg"、"PG 18.3"、"server/db.js:RANK_TIERS"、"PG_PASSWORD"。但仓库里：`server/package.json:14` 是 `mysql2`，没有 `pg` 包；`server/db.js:11` `require("mysql2/promise")`；`server/sql/001_init.sql` 全是 MySQL 语法（`AUTO_INCREMENT`、`ENGINE=InnoDB`、反引号、`ON DUPLICATE KEY UPDATE`、`CURDATE()`、`DATE_SUB(... INTERVAL 1 DAY)`）。这是文档/代码大型 drift，任何根据 CLAUDE.md 写新 SQL 的人都会写错方言。**修复**：CLAUDE.md 整段"Server / RDS 接入"换成 MySQL；或者把代码迁到 PG。

## P1 — silent bug（用户感知不到但功能不对）

- [ ] **chat 页有，app.json 没注册** — `miniprogram/pages/chat/chat.{js,json,wxml}` 三件套齐全，但 `miniprogram/app.json:2-16` 的 `pages` 列表没有 `"pages/chat/chat"`。结果：编译时被忽略，无法 navigateTo 到，连入口都进不去。`chat.js:247` 内部还 `path: "/pages/chat/chat"` 用于分享卡，分享后用户点进来也是 404。**修复**：在 `app.json` pages 数组加上 `"pages/chat/chat"`。

- [ ] **chat.js 调了 `userProfile.getOpenid()` 这个方法不存在** — `miniprogram/pages/chat/chat.js:45-46` `if (userProfile && typeof userProfile.getOpenid === "function") { const id = userProfile.getOpenid() }`。但 `miniprogram/utils/userProfile.js:79-83` 实际导出的是 `getOrCreateOpenId`、`getProfile`、`setProfile`，**没有 `getOpenid`**。`typeof` 那段永远 false → 走 fallback 用 `lbr_fake_openid` storage key。其他页面（leaderboard / pk / daily）都用 `lbr_openid`。**结果：同一用户在 chat 和其他页面有两个不同 openid，服务端记账会重复。** 修复：chat.js 应改为 `userProfile.getOrCreateOpenId()`。

- [ ] **server.js 健康检查会拖死启动** — `/health` 路由 `db.healthCheck()` 会触发 `getPool()`，第一次连接时如果 RDS 不可达，express 没问题但 health 永远 500。再加上 dotenv 没加载这条已经稳挂。

- [ ] **leaderboard 服务端返回的 tier 是 string，前端处理只用了部分** — `server/routes/leaderboard.js:10` 返回 `tier` 列为 string id（如 `"bronze"`）。`miniprogram/utils/duel.js:245` 直接 `tier: row.tier` 存进 player 对象。其他 wxml 用的是 `myRank.tier.name`（对象形式）。`leaderboard.js:_buildMyRank` 已经从 RANK_TIERS 重算对象覆盖了 string，所以"自己那行"显示对。但 player 列表里其他人的 tier 字段是 string，wxml `leaderboard.wxml` 没用到所以不挂；以后任何代码读 `player.tier.name` 都会 undefined。**契约不一致，写下来。**

- [ ] **submitMatch 数据契约文档错了** — `miniprogram/utils/duel.js:14` 注释说 `submitMatch(id, ans, qs) → {score, rankChange, history}`，但 `duel.js:402` 实际 `return { score, correct, total, rankChange, record }`。没有 `history` 字段，多了 `correct/total/record`。pk.js 只用对的几个字段所以没崩，但文档误导。

- [ ] **app.json 与 onboarding 写死的数据规模不同步** — `miniprogram/pages/onboarding/onboarding.js:8` 写死 `"175 反驳卡 / 559 别名 / 46 类争议"`，但 `arsenal` 实际 215 卡 / 730 别名（与 CLAUDE.md "Current Baseline (v2.5)" 一致）。`pages/about/about.js:8-20` 是运行时从 arsenal 算的（对）。onboarding 数字过时。

- [ ] **about.js 版本号写死 `v2.0`** — `miniprogram/pages/about/about.js:14, 19`。其他地方：index.wxml v2.6、onboarding v2.6、result.wxml v2.6、cardShare.js v2.1、CLAUDE.md v2.6。"关于本应用" 页用户最常看的就是版本，写 v2.0 直接拉信任。

- [ ] **PK 页面 totalQuestions 为 0 时 wxml 除零产生 NaN width** — `pk.wxml:9` `width: {{((step + 1) * 100) / totalQuestions}}%`，若 `_pickRandomCards(5)` 返回 0 张（arsenal 为空或全部过滤掉），totalQuestions=0 → 进度条 NaN。当前 arsenal 215 张所以不会触发，但属于无防御。

- [ ] **35 处 `catch (e) {}` 空捕获，无任何 log** — 整个项目（含 `duel.js`、`onboarding.js`、`daily.js`、`index.js`、`storage.js`、`memeShare.js`）共 35 处 catch 块只吞错不记日志。一旦 wx.storage 写失败 / json 解析失败 / 跳页失败，用户和开发者都看不到任何线索。建议至少在 utils 层加 `console.warn` 包一层。

## P2 — 代码味道

- [ ] **冗余/没人用的 utils/promptBuilder.js** — `miniprogram/utils/promptBuilder.js` 全文 57 行。`grep -rn "promptBuilder\|buildPrompt"` 在 miniprogram/、scripts/、server/、cloudfunctions/ 里只匹配文件自身。只有 `package.json` 的 `check:syntax` 脚本 require 它确认语法。线上 prompt 已经移到 `server/routes/llm.js` 和 `cloudfunctions/generateReply/index.js`。**死代码**，可删。

- [ ] **死数据文件 `miniprogram/data/player_comparisons.js`** — 没有任何代码 require 它。

- [ ] **index.js 内 4 个空函数防御层** — `index.js:148-156` `onQuickTap` / `onCategoryTap` / `onClearCategory` / `setSearchResults` / `applyResults` 都是空函数体，注释说"防御性空函数"。可以确认 wxml 没人 bind 这些 handler，删除即可（保留只是冗余）。

- [ ] **duel.js 顶部 JSDoc 与 module.exports 字段不一致** — `duel.js:9-15` 列了 `getLeaderboard / fetchLeaderboard / getMyRank / startMatch / submitMatch / getDuelHistory`，但实际 `module.exports`（line 443-453）多了 `RANK_TIERS, clearDuelHistory, getStats`。

- [ ] **submitMatch 注释 "history" 字段不存在** — 见 P1 副本。

- [ ] **uniformization：duel.js / llmProvider.js / api.js 有 console.warn，无统一 log prefix** — 各自用 `[duel]`、`[llm]`、`[api]`、`[daily]`、`[meme]`，但没人统一收集。线上排错只能 grep。

- [ ] **cloudfunctions/generateReply/index.js 与 server/routes/llm.js 重复实现** — `buildSystemPrompt` 几乎完全一样（cloudfunctions 多了 "防绕过" 一段），将来改 prompt 容易漏一份。建议：提取共享 module 或确定弃用一份。

- [ ] **server/test-connect.js 与 server.js 不一致** — `test-connect.js:1` `require("mysql2/promise")` + `require("dotenv").config()`，跟 server.js 行为不一致（后者不加载 dotenv）。`test-connect.js` 测通 ≠ 业务能跑。

- [ ] **HTTPS 后 BASE_URL 是云托管地址不是自己的域名** — `miniprogram/utils/api.js:22` `DEFAULT_BASE_URL = "https://express-5hpi-259564-8-1434513466.sh.run.tcloudbase.com"`，看着像云托管 URL（已部署？）。CLAUDE.md 说"等备案 + ECS"，但默认 base 已经指向云托管。两条线在跑？容易混淆部署目标。

- [ ] **DEMO/TEST/TODO 注释残留** — `server/routes/chat.js:164-168` 「【Phase 2 quota hook】」+ `MVP 阶段直接放行`；`server/routes/chat.js:25-26` `HISTORY_WINDOW_MAX = 10` / `KEEP_RECENT = 8` — 截断逻辑：超过 10 条剪到 8 条，意味着第 11 条来时会丢掉历史前 3 条；策略可以但需要文档。

## P3 — 一致性

- [ ] **段位阈值在 progression.js vs duel.js 完全不同** — duel.js (PK 用): 0/200/500/1000/1800；progression.js (阅读/复制用): 0/10/30/80/150。这是按 CLAUDE.md 设计的（两个评分系统：浏览/复制单位 vs PK 分），但 `rank-tier-sync` skill 假设只有一套，会误报。**应在 CLAUDE.md 段位 enum 表里明确"前端 PK 用 duel.js 表，前端阅读用 progression.js 表"。**

- [ ] **段位 enum 4 处 vs CLAUDE.md 写的"5 个权威点"** — 实际权威点是 4 处：duel.js / progression.js / server/db.js / server/sql/001_init.sql。CLAUDE.md 本身是第 5 点（文档）。rank-tier-sync skill 描述对，但段位阈值已经在 progression.js 与 duel.js 永久不同，没法用同一个表对齐。

- [ ] **about.js 写死的 nextRank.threshold = 10** — `about.js:26` `nextRank: { id: 'silver', name: '白银詹蜜', threshold: 10 }`，是 progression.js 的阈值（对的）。但写成硬编码 fallback，progression.js 未来改阈值这里不会跟着改。

- [ ] **README / CLAUDE.md 说"PG 18.3 验证通过"** — 实际 server/* 全是 mysql2 + MySQL SQL。CLAUDE.md 这段"进度表"误导后续 agent 的工具栈判断。

- [ ] **DEEPSEEK_MODEL 三处默认值不一致** —
  - `cloudfunctions/generateReply/index.js:8`: `deepseek-v4-flash`
  - `server/routes/llm.js:14`: `deepseek-v4-flash`
  - `server/routes/chat.js:20`: `deepseek-chat`
  
  以及 `.env:34` 设的也是 `deepseek-v4-flash`（不是真实 model）。chat.js 那条是对的。

- [ ] **openid storage key 不一致** — `miniprogram/utils/userProfile.js:13` 用 `lbr_openid`；`miniprogram/pages/chat/chat.js:52` 用 `lbr_fake_openid`。同一个 fake openid 字段两个 key，互相不同步。

- [ ] **app.json `pages` 13 项，但实际 `miniprogram/pages/` 有 14 个目录** — 多出 `chat/`（已记 P1）。

- [ ] **api.js DEFAULT_TIMEOUT_MS = 5000ms，但 LLM 调用要 30000ms** — `api.js:24` 默认 5s 超时，`llmProvider.js:50` 单独传 `{ timeout: 30000 }` 覆盖。可以但易遗忘，下次写新 AI 调用容易超时。

## P4 — 安全

- [ ] **DEEPSEEK_API_KEY 真实值仍在 server/.env 里** — `server/.env:30` `DEEPSEEK_API_KEY 值已 redact`。这个 key 已在过往对话泄露（CLAUDE.md 自己承认）。.env 虽然 .gitignored，但本地任何截图 / log / 错误回溯都能拿到。**CLAUDE.md 已明确用户决定不 rotate**，但工具/agent 看见这条记录后还是要避免重复出现在 log/stdout。

- [ ] **PG_PASSWORD 真实值 `<redacted-pg-password>` 同时存在 3 处文件** —
  - `server/.env:15`（.gitignored，OK）
  - `server/_quarantine/lebron_rds.txt:15`（_quarantine/ 在 server/.gitignore，OK）
  - 备份目录 `~/.claude/projects/-Users-happytang/memory_backup_20260515_123155/`（CLAUDE.md 提到，未确认）
  
  虽然都不在 git，但纸面暴露面 ≥ 3 处。**根据 CLAUDE.md 用户已决定不 rotate**，保留即可，不主动建议。

- [ ] **`server/_quarantine/lebron_rds.txt` 字段顺序错乱**（信息泄漏放大）：
  字段顺序：
  - PG_PORT 行 → 值是密码（应该是端口号）
  - PG_USER 行 → 值是 5432（应该是用户名）
  - PG_PASSWORD 行 → 值是密码
  
  密码同时出现在 `PG_PORT` 和 `PG_PASSWORD` 两个字段。看起来是粘贴时键值错位。`README.txt` 写了 "DO NOT COMMIT"，且 server/.gitignore 有 `_quarantine/`，目前没进 git。但任何手贱 `git add server/_quarantine -f` 就一次性外泄两次。

- [ ] **`project.config.json:4` `urlCheck: false`** — 关闭了微信的服务端域名白名单校验。开发期方便，但如果 `setting.urlCheck` 一直保持 false 上传到正式版（小程序云端会忽略此开关，由后台白名单决定），就算上线没事，但暴露给本地开发者：可以请求任何域名（包括钓鱼 / 第三方 API），缺少 lint 防护。

- [ ] **appid 真实值在 project.config.json:35** — `wx48219c5f65cc2e7b`。这是小程序公开标识符，本身不算"机密"，但开源仓库带 appid 等于把"这个项目对应哪个上线小程序"暴露了。可考虑用 `__YOUR_APPID__` 占位 + 模板说明。

- [ ] **没有任何用户输入 sanitization** — `pk.js submit` 服务端校验：openid 长度 / score 范围 / total 范围（routes/pk.js:14-25），还行。`chat.js submit` 在前端校了 500 字（chat.js:135-137），后端 `routes/chat.js:88` 单条截 2000 字，OK。但 `userQuery` / `nickname` / `card_id` 任意 string，未做 XSS / 控制字符过滤。MVP 阶段可接受，但记下来。

- [ ] **SQL 用的全是 prepared statement，没拼接** — `server/routes/*.js` 全部 `?` 占位，参数走数组。无 SQL injection 风险。✓

## 扫描覆盖范围

**扫了的目录**：
- `miniprogram/` 全部（13 + 1 个 page、12 个 utils、1 个 component、27 个 data 文件、app.json / sitemap.json）
- `server/` 全部（server.js、db.js、5 个 routes、sql/001_init.sql、test-connect.js、test-api.sh、Dockerfile、package.json、.env、.env.example、.gitignore、_quarantine/）
- `cloudfunctions/generateReply/` 全部（index.js + package.json）
- `project.config.json`, `project.private.config.json`, `.gitignore`, `package.json`

**扫的文件数**（不含 node_modules / miniprogram_npm）：约 95 个 JS + 14 个 JSON + 14 个 WXML + WXSS + 1 个 SQL + 2 个 .env + 1 个 .gitignore。

**扫的方法**：
- Read 全文（关键 ~30 个文件）
- grep 模式：`bindtap`、`wx.navigateTo`、`require(`、`catch.*{}`、`console.log/warn/error`、`bronze/silver/gold/diamond/king`、阈值数字、`TODO/FIXME`、`/api/`、`process.env`、`PG_/MYSQL_/DEEPSEEK_`、`getOpenid/getOrCreateOpenId`
- 交叉对比：app.json 的 pages vs 实际 pages/ 子目录、wxml 的 usingComponents vs JSON 注册、wxml bindtap 名字 vs JS 函数名、前端 API 调用 vs 后端 route mount、段位 enum 跨 4 处

## 没扫到的（已知限制）

- **运行时行为**：DeepSeek 真实联调没跑（需要 token + 真实 model 名称），无法验证 server.js 不加 dotenv 是否在 PM2/Docker 环境下能从外部 env 补齐。
- **wx 真机表现**：所有 wx.* API 调用只做了静态匹配；真机上 setData 时序、navigate 失败回调、storage 容量上限（10MB）未模拟。
- **数据完整性**：730 别名 / 215 卡 / 22 categories 的 id 互引（aliases.categoryId / aliases.targetId 是否真的指向存在的 category/card）未做逐项验证。`scripts/test-corpus-integrity.js` 应该覆盖。
- **微信小程序审核策略**：项目里的"詹黑"/"米奇冠军" 等词是否过审，是平台审查问题，不在代码静态扫描范畴。
- **PM2 / Docker 部署细节**：Dockerfile EXPOSE 80 但代码 `process.env.PORT || 80`，test-api.sh 假设 3000，多源不一致。需要部署文档明确。
- **CloudBase / ECS 备案进度**：纯运维问题，超出本次代码审查范围。

---

## 关键修复优先级建议

1. **立刻**：P0 的 dotenv + .env 前缀 + DEEPSEEK_MODEL — 这三条任何一个不修，server 上线那一秒就 500 全挂。
2. **本周**：P1 的 chat 页 app.json + chat.js openid 函数名 + onboarding 数字 + about.js 版本号 — 用户可见 bug 全 polished 一波。
3. **下次重构时**：P2/P3 的死代码 + 文档对齐 + 段位 enum 双系统注释。
4. **不动**：P4 的密码 rotation 用户已明确决定不做。
