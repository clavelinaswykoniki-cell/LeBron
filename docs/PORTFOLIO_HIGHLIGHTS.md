# LeBron 詹黑逻辑拆解器 · Portfolio Highlights

> 给招聘官 / 面试官的 90 秒概览。

---

## 一句话定位

我设计并实现了一个**全栈微信小程序**：客户端（小程序）+ REST API（Node/Express）+ 数据库（PostgreSQL）+ AI 增强（DeepSeek 代理）+ 阿里云 ECS 部署，**一个人交付**。

围绕「篮球粉丝在评论区辩论」这个具体场景，把 215 张反驳卡片化、加入 PK 段位赛 / 排行榜 / 每日签到 / 梗图工厂 / 朋友圈分享。

---

## 技术栈速览

| 层 | 技术 | 关键决策 |
|---|---|---|
| 客户端 | WeChat MiniProgram 原生 | 不引 Taro/uni-app，保留对平台 API 的直接控制 |
| 客户端 UI | TDesign Mini-Program 1.14 | 用官方组件，但所有视觉走湖人紫金主题 wxss |
| 后端 | Node 18 + Express 4 | 没用 Nest/Koa 等重型框架——业务简单，过度抽象反伤可读性 |
| 数据库 | PostgreSQL 18（阿里云 RDS） | 选 PG 而非云开发：portfolio 想展示真实 SQL 能力 + 事务设计 |
| AI 增强 | DeepSeek V4 Flash | 通过自家后端代理，**key 永远不出现在客户端**——这是 portfolio 的必答题 |
| 部署 | 阿里云 ECS + Nginx + PM2 + Let's Encrypt | 自己装环境，不走云开发的"傻瓜流" |
| CI/CD | GitHub Actions（matrix: Node 18 + 20） | 每次 push 自动跑 8 套测试 |

---

## 我亲手做的架构决策（看得到的工程思考）

### 1. 双路径策略：API 失败必须降级到本地

每个网络调用都接 `requestWithFallback(method, path, data, fallbackFn)`：
- `getLeaderboard` 失败 → 本地 100 个 mock 玩家
- `submitMatch` 调 API 是 fire-and-forget，本地 history 同步写入
- `enhance` AI 失败 → 返回本地反驳卡

**为什么**：小程序在地铁/电梯/弱网下是常态。让用户体感是"网络慢"而非"崩了"。

**代码位置**：`miniprogram/utils/api.js:requestWithFallback`、`miniprogram/utils/duel.js:fetchLeaderboard`

---

### 2. 安全边界：DeepSeek API key 绝不进客户端

```
小程序 → POST /api/llm/enhance → 后端读 process.env.DEEPSEEK_API_KEY → DeepSeek
```

小程序代码 = 前端代码，反编译即可拿 key 刷余额。**面试官十次有八次会问这个**，所以我把 CloudBase scaffold 改成自有 Express 代理路由。

**代码位置**：`server/routes/llm.js`（移植自 `cloudfunctions/generateReply/index.js`，保留 prompt 不变）

---

### 3. 段位 schema 前后端对齐

前端 `duel.js` 定义 5 档段位 `bronze(0) / silver(200) / gold(500) / diamond(1000) / king(1800)`。

后端 `001_init.sql` 写 `CHECK (rank IN (...))` 约束。**第一次跑就发现 SQL 里写错 `platinum`**——前端字段写后端会被 CHECK 拒。

**修法**：把权威源放前端 `duel.js:RANK_TIERS`，后端 `db.js:RANK_TIERS` 是镜像。任何阈值改动两边同步，CI 测试验证一致性。

**代码位置**：`miniprogram/utils/duel.js:25`、`server/db.js:RANK_TIERS`、`server/sql/001_init.sql:43`

---

### 4. 事务设计：PK 提交的强一致

`POST /api/pk/submit` 在一个事务里做 4 件事：
1. UPSERT user（避免新用户先注册再 PK）
2. 读旧 leaderboard 段位（确定 `rank_before`）
3. UPSERT leaderboard（score = max(old+delta, 0)，total_matches += 1，wins += isWin ? 1 : 0）
4. INSERT match_records（流水表，追溯用）

**为什么**：用户连点提交可能造成竞态。事务 + UPSERT + ON CONFLICT 三层防御。

**代码位置**：`server/routes/pk.js:46-100`

---

### 5. 工程纪律

- **测试**：8 个前端单元 + 9 步 curl smoke。`scripts/test-ai-enhance-fallback.js` 验证 LLM 三态（missing / failure / success），改架构必须先改测试再改实现
- **安全**：`.gitignore` 多层防御（`.env / .env.* / lebron rds / *.rds / _quarantine/`），泄露文件隔离不删除（保留可逆性）
- **协作约束**：项目根 `CLAUDE.md` 写死 AI 协作时的硬约束（never paste passwords, never bypass fallback），等于人机 contract
- **版本约束**：CLAUDE.md 的「进度表」每次会话同步更新，避免 AI 协作时上下文飘移

---

## 数据规模

| 指标 | 数量 |
|---|---|
| 反驳卡 | 215 张（多源合并 + 去重） |
| 别名 / 短梗 | 730 条 |
| 争议分类 | 46 类 |
| 已实现页面 | 12 个 |
| 后端表 | 4 张 |
| 后端 API | 5 个 |
| 测试用例 | 前端 8 套 + 后端 9 步 smoke |

---

## 实际能讲的故事（面试场景）

1. **「为什么从 CloudBase 切到自建后端？」**
   答：CloudBase 让 API key 留在云函数 env 是安全的，但 portfolio 上"我装了 ECS + 写了 Express + 装了 Nginx"的可讲性远高于"我点了几下云开发"。
2. **「为什么用 PostgreSQL 不是 MySQL？」**
   答：PG 18 的 ON CONFLICT、JSON 类型、CHECK 约束都用上了；MySQL 也行但 PG 在「写起来更舒服」上略胜。本质是个人选择 + 对工具更熟。
3. **「这个 schema drift 是怎么发现的？」**
   答：第一次跑 smoke test，`POST /api/pk/submit` 返回 500，看 PG 日志是 CHECK 违反。这种问题不写测试永远不知道——所以我的 smoke script 现在覆盖所有 5 个段位流转。
4. **「降级策略实际多有用？」**
   答：本地 emulator 关掉后端再跑一遍 PK 流程，UI 完全不报错——这是真实弱网体验。给面试官现场断网演示。
5. **「头像怎么处理的？多设备同步呢？」**
   答：用 WeChat 2022 推出的 `chooseAvatar` button + `type="nickname"` input（替代废弃的 `wx.getUserProfile` 授权弹窗）。临时文件路径本机可见、跨设备需要上 OSS——v2.6 没做，文档承认了限制（这是 portfolio 重要技巧：**承认 trade-off 比假装完美靠谱**）。

---

## 项目主页

- **GitHub**: https://github.com/clavelinaswykoniki-cell/LeBron （CI badge 直接对外）
- **小程序体验**: 待 ICP 备案后开放扫码（备案中）
- **架构图**: 见 `README.md` 顶部 mermaid

---

## 一句话总结（适合放简历）

> 全栈微信小程序 `LeBron 詹黑逻辑拆解器`：215 卡 / 730 别名 / 12 页面 / 4 表 / 5 API，Node + Express + PostgreSQL + DeepSeek，部署阿里云 ECS，8 套自动化测试 + CI，单人交付。
