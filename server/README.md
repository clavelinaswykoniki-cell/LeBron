# LeBron Miniapp Server

后端 API 服务（Node.js + Express + PostgreSQL）。

## 当前阶段

🚧 **Phase 0：RDS 连接验证**
（备案还在跑，先把数据库这一段练通。Express API 等备案下来再写。）

## 目录

```
server/
├── package.json
├── .env.example          模板，可 commit
├── .env                  真实凭证，已被 .gitignore，永远不 commit
├── .gitignore
├── sql/
│   └── 001_init.sql      建表脚本（幂等，可重复执行）
├── test-connect.js       RDS 连接 + 表结构检查
└── README.md
```

## 使用步骤

### Step 1：阿里云 RDS 后台准备

在 RDS 控制台依次操作：

1. **账号管理 → 创建账号**
   - 账号：`lebron_api`
   - 类型：高权限账号（先用，后期拆 admin/api 二级权限）
   - 密码：强密码，**自己存好，不要发任何聊天/邮件**
2. **数据库管理 → 创建数据库**
   - 名字：`lebron`
   - 字符集：`UTF8`
3. **数据库连接 → 申请外网地址**（本地测试用，备案后切内网）
4. **白名单设置 → 加你当前公网 IP**（百度搜「我的 IP」，格式 `1.2.3.4/32`）

### Step 2：本地安装

```bash
cd server
npm install
cp .env.example .env
# 用编辑器打开 .env，填入真实 RDS 连接信息
```

⚠️ **`.env` 永远不要 commit / 截图 / 发到聊天**。已被 `.gitignore`。

### Step 3：建表

用 GUI 工具（推荐 [TablePlus](https://tableplus.com/) 或 [DBeaver](https://dbeaver.io/)）：

1. 新建连接 → PostgreSQL → 填外网地址 + 5432 + lebron_api + 密码 + lebron
2. 测试连接 → 成功
3. 打开 `server/sql/001_init.sql`
4. 全选 → 执行

预期：4 张表 + 1 行测试数据。

### Step 4：连接验证

```bash
npm run test:connect
```

成功输出示例：

```
=== LeBron RDS 连接测试 ===
  host: pgm-xxx.pg.rds.aliyuncs.com
  port: 5432
  user: lebron_api
  db:   lebron
  ssl:  off

[OK]   TCP + 认证 通过
[OK]   RDS 时间: 2026-05-18T12:34:56.789Z
[OK]   PG 版本: PostgreSQL 14.x
[OK]   现有表: checkins, leaderboard, match_records, users
[OK]   leaderboard 行数: 1

=== 全部通过，RDS 链路 OK ===
```

## 表结构概览

| 表 | 用途 | 关键字段 |
|---|---|---|
| `users` | 用户基础信息 | `openid`(PK), `nickname`, `avatar_url` |
| `leaderboard` | 段位排行（每人 1 行） | `openid`(UNIQUE), `score`, `rank` |
| `match_records` | PK 对战流水 | `openid`, `score`, `delta`, `played_at` |
| `checkins` | 每日签到 | `(openid, checkin_date)` UNIQUE |

## 安全约定（红线）

| 红线 | 原因 |
|---|---|
| ❌ 不在代码 / 聊天 / commit / 截图里出现真实密码 | LLM 对话不是安全通道 |
| ❌ 不在主账号上签发 AccessKey 给第三方 | 一旦泄露 = 整个云账号失守 |
| ✅ `.env` 只放本地 + ECS 服务器上，chmod 600 | 单点存储，方便轮换 |
| ✅ 上 ECS 后 RDS 关公网，只开内网 + 白名单 | 公网 5432 永远是扫描机器人靶子 |
| ✅ 后续拆 `lebron_admin`（DDL）+ `lebron_api`（业务只读写） | 最小权限 |

## 后续路径（等 ICP 备案下来）

1. SSH 上 ECS `39.107.192.89`
2. 装 Node.js 20 / Nginx / PM2 / certbot
3. `git clone` 本仓库到 `/opt/lebron-rebuttal-miniapp`
4. `cd server && npm install --production`
5. 在 ECS 本机写 `.env`（chmod 600）
6. 写 Express API：`/api/leaderboard` / `/api/pk/submit` / `/api/daily/checkin`
7. Nginx 反代 + Let's Encrypt HTTPS
8. 域名解析到 ECS 公网 IP
9. 小程序 `miniprogram/utils/api.js` 改成走真实域名
10. 微信公众平台 → 服务器域名 → request 合法域名 加入 `https://你的域名`
11. 小程序提交审核 → 发布
