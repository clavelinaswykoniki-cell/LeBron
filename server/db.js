const mysql = require("mysql2/promise")

let pool = null

function getPool() {
  if (pool) return pool

  var addr = process.env.MYSQL_ADDRESS || "localhost:3306"
  var host = addr.split(":")[0]
  var port = Number(addr.split(":")[1]) || 3306

  pool = mysql.createPool({
    host: host,
    port: port,
    user: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "lebron",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4"
  })

  return pool
}

var RANK_TIERS = [
  { id: "bronze",  threshold: 0    },
  { id: "silver",  threshold: 200  },
  { id: "gold",    threshold: 500  },
  { id: "diamond", threshold: 1000 },
  { id: "king",    threshold: 1800 }
]

function rankFor(score) {
  var s = Math.max(0, Number(score) || 0)
  var tier = RANK_TIERS[0]
  for (var i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].threshold <= s) tier = RANK_TIERS[i]
  }
  return tier.id
}

async function query(sql, params) {
  return getPool().query(sql, params)
}

async function getConnection() {
  return getPool().getConnection()
}

async function healthCheck() {
  var [rows] = await query("SELECT NOW() AS `now`, VERSION() AS version")
  return rows[0]
}

module.exports = {
  getPool: getPool,
  query: query,
  getConnection: getConnection,
  healthCheck: healthCheck,
  RANK_TIERS: RANK_TIERS,
  rankFor: rankFor
}
