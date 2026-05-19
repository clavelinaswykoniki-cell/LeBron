/**
 * server.js — Express API 入口
 *
 * 中间件链：
 *   1. cors            允许小程序跨域
 *   2. express.json    32KB body 限制，超出会抛 PayloadTooLargeError
 *   3. access-log      简单 stdout 日志：method url -> status latency
 *   4. routes          /api/leaderboard /api/pk /api/daily /api/llm
 *   5. 404 handler
 *   6. error handler   兜底，吐 JSON
 *
 * 关停流程：SIGINT / SIGTERM 都走 shutdown()，先停接受新连接，
 *           然后 await db.close() 关池，10s 超时强制 exit(1)。
 *
 * 环境变量加载：本地 npm start 时通过 dotenv 读 server/.env；
 * 云托管生产环境直接注入环境变量，dotenv 找不到 .env 文件不报错（silent）。
 */

// 加载本地 .env（云托管 prod 没有这个文件，silent 忽略）
try { require("dotenv").config() } catch (e) { /* dotenv 未装 or 无 .env，靠 process.env 兜底 */ }

const express = require("express")
const cors = require("cors")
const db = require("./db")

const app = express()
app.use(cors())
app.use(express.json({ limit: "32kb" }))

// access log — 单行格式，便于 grep
app.use(function (req, res, next) {
  const t0 = Date.now()
  res.on("finish", function () {
    const ts = new Date().toISOString()
    const ms = Date.now() - t0
    console.log("[" + ts + "] " + req.method + " " + req.originalUrl + " -> " + res.statusCode + " " + ms + "ms")
  })
  next()
})

app.get("/", function (req, res) {
  res.json({ service: "lebron-api", ok: true })
})

app.get("/health", async function (req, res) {
  try {
    const info = await db.healthCheck()
    res.json({ ok: true, db: info })
  } catch (e) {
    console.error("[health] db error:", e && e.message)
    res.status(500).json({ ok: false, error: e.message })
  }
})

app.use("/api/leaderboard", require("./routes/leaderboard"))
app.use("/api/pk", require("./routes/pk"))
app.use("/api/daily", require("./routes/daily"))
app.use("/api/llm", require("./routes/llm"))
app.use("/api/llm", require("./routes/chat"))

// 404
app.use(function (req, res) {
  res.status(404).json({ error: "not found", path: req.originalUrl })
})

// 兜底 error handler
// 注意：express.json 的 SyntaxError 也会从这里走，吐 400 比 500 更准确
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  const isBodyError = err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)
  const status = isBodyError ? 400 : (err.status || 500)
  console.error("[err]", req.method, req.originalUrl, "->", status, err.stack || err.message)
  res.status(status).json({ error: err.message || "internal error" })
})

const port = Number(process.env.PORT || 80)
const server = app.listen(port, function () {
  console.log("[lebron-server] listening on port " + port)
})

// ---- graceful shutdown ----
const SHUTDOWN_TIMEOUT_MS = 10000
let _shuttingDown = false

function shutdown(signal) {
  if (_shuttingDown) return
  _shuttingDown = true
  console.log("[lebron-server] shutting down (" + signal + ")")

  // 强制 exit 兜底：避免被卡住的连接挂死进程
  const killTimer = setTimeout(function () {
    console.error("[lebron-server] shutdown timeout, forcing exit")
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  if (killTimer.unref) killTimer.unref()

  server.close(async function () {
    try {
      await db.close()
    } catch (e) {
      console.error("[lebron-server] db.close error:", e && e.message)
    }
    clearTimeout(killTimer)
    process.exit(0)
  })
}

process.on("SIGINT", function () { shutdown("SIGINT") })
process.on("SIGTERM", function () { shutdown("SIGTERM") })

// 兜底 uncaught，避免静默崩；让 PM2 / docker restart 接管
process.on("unhandledRejection", function (reason) {
  console.error("[unhandledRejection]", reason && reason.stack ? reason.stack : reason)
})
process.on("uncaughtException", function (err) {
  console.error("[uncaughtException]", err && err.stack ? err.stack : err)
})
