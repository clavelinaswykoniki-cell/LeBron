/**
 * test-connect.js — 验证 MySQL 连接 + 列表已有表
 *
 * 用法：
 *   cd server && npm run test:connect
 *
 * 注意：单独连一次（不复用 pool）以保证测试纯净；
 *       结束时 await conn.end() 保证不留泄露的句柄。
 */

const mysql = require("mysql2/promise")
require("dotenv").config()

function parseAddress(addr, fallbackPort) {
  const s = String(addr || "")
  const sepIdx = s.indexOf(":")
  if (sepIdx < 0) return { host: s || "localhost", port: fallbackPort }
  return {
    host: s.slice(0, sepIdx) || "localhost",
    port: Number(s.slice(sepIdx + 1)) || fallbackPort
  }
}

const addr = parseAddress(process.env.MYSQL_ADDRESS, 3306)
const user = process.env.MYSQL_USERNAME || "root"
const password = process.env.MYSQL_PASSWORD || ""
const database = process.env.MYSQL_DATABASE || "lebron"

async function main() {
  console.log("=== LeBron MySQL 连接测试 ===")
  console.log("  host:", addr.host)
  console.log("  port:", addr.port)
  console.log("  user:", user)
  console.log("  db:  ", database)
  console.log("")

  let conn
  try {
    conn = await mysql.createConnection({
      host: addr.host,
      port: addr.port,
      user: user,
      password: password,
      database: database,
      charset: "utf8mb4"
    })
    console.log("[OK]   连接成功")
  } catch (e) {
    console.error("[FAIL] 连接失败:", e.message)
    process.exit(1)
  }

  let exitCode = 0
  try {
    const [verRows] = await conn.query("SELECT NOW() AS `now`, VERSION() AS version")
    console.log("[OK]   MySQL 时间:", verRows[0].now)
    console.log("[OK]   MySQL 版本:", verRows[0].version)
    console.log("")

    const [tables] = await conn.query("SHOW TABLES")
    const tableNames = tables.map(function (r) { return Object.values(r)[0] })

    if (tableNames.length === 0) {
      console.log("[INFO] 还没有表，请执行 server/sql/001_init.sql")
    } else {
      console.log("[OK]   现有表:", tableNames.join(", "))
      if (tableNames.indexOf("leaderboard") >= 0) {
        const [cntRows] = await conn.query("SELECT COUNT(*) AS c FROM leaderboard")
        console.log("[OK]   leaderboard 行数:", cntRows[0].c)
      }
    }

    console.log("")
    console.log("=== 全部通过，MySQL 链路 OK ===")
  } catch (e) {
    console.error("[FAIL] 查询失败:", e.message)
    exitCode = 1
  } finally {
    // 任何路径下都关连接，避免句柄泄露
    try { await conn.end() } catch (e) { /* swallow */ }
  }

  if (exitCode !== 0) process.exit(exitCode)
}

main().catch(function (e) {
  console.error("[FAIL]", e && e.message ? e.message : e)
  process.exit(1)
})
