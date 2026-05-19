var mysql = require("mysql2/promise")
require("dotenv").config()

var addr = process.env.MYSQL_ADDRESS || "localhost:3306"
var host = addr.split(":")[0]
var port = Number(addr.split(":")[1]) || 3306
var user = process.env.MYSQL_USERNAME || "root"
var password = process.env.MYSQL_PASSWORD || ""
var database = process.env.MYSQL_DATABASE || "lebron"

async function main() {
  console.log("=== LeBron MySQL 连接测试 ===")
  console.log("  host:", host)
  console.log("  port:", port)
  console.log("  user:", user)
  console.log("  db:  ", database)
  console.log("")

  var conn
  try {
    conn = await mysql.createConnection({
      host: host,
      port: port,
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

  try {
    var [rows] = await conn.query("SELECT NOW() AS `now`, VERSION() AS version")
    console.log("[OK]   MySQL 时间:", rows[0].now)
    console.log("[OK]   MySQL 版本:", rows[0].version)
    console.log("")

    var [tables] = await conn.query("SHOW TABLES")
    var tableNames = tables.map(function (r) { return Object.values(r)[0] })

    if (tableNames.length === 0) {
      console.log("[INFO] 还没有表，请执行 server/sql/001_init.sql")
    } else {
      console.log("[OK]   现有表:", tableNames.join(", "))
      if (tableNames.indexOf("leaderboard") >= 0) {
        var [cnt] = await conn.query("SELECT COUNT(*) AS c FROM leaderboard")
        console.log("[OK]   leaderboard 行数:", cnt[0].c)
      }
    }

    console.log("")
    console.log("=== 全部通过，MySQL 链路 OK ===")
  } catch (e) {
    console.error("[FAIL] 查询失败:", e.message)
    process.exit(1)
  } finally {
    await conn.end()
  }
}

main().catch(function (e) {
  console.error("[FAIL]", e && e.message ? e.message : e)
  process.exit(1)
})
