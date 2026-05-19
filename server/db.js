/**
 * db.js — MySQL 连接池 + 段位 helper（前后端 enum 必须保持一致：参见 CLAUDE.md）。
 *
 * 设计：
 *   - 单例 pool（首次调用 getPool 时创建）
 *   - 通过环境变量 MYSQL_ADDRESS=host:port 拼出 host/port，兼容云平台风格
 *   - query / getConnection / healthCheck 都走同一个 pool
 *   - 默认 utf8mb4，避免存中文 emoji 时报错
 */

const mysql = require("mysql2/promise")

let _pool = null

/** "host:port" → { host, port } */
function _parseAddress(addr, fallbackPort) {
  const s = String(addr || "")
  const sepIdx = s.indexOf(":")
  if (sepIdx < 0) return { host: s || "localhost", port: fallbackPort }
  const host = s.slice(0, sepIdx) || "localhost"
  const port = Number(s.slice(sepIdx + 1)) || fallbackPort
  return { host: host, port: port }
}

function getPool() {
  if (_pool) return _pool

  const addr = _parseAddress(process.env.MYSQL_ADDRESS, 3306)

  _pool = mysql.createPool({
    host: addr.host,
    port: addr.port,
    user: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "lebron",
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_POOL_LIMIT) || 10,
    charset: "utf8mb4"
  })

  return _pool
}

/** 段位定义 — 必须与 miniprogram/utils/duel.js 和 SQL CHECK 约束完全一致 */
const RANK_TIERS = [
  { id: "bronze",  threshold: 0    },
  { id: "silver",  threshold: 200  },
  { id: "gold",    threshold: 500  },
  { id: "diamond", threshold: 1000 },
  { id: "king",    threshold: 1800 }
]

/**
 * 给定分数返回段位 id。RANK_TIERS 是升序，可以一旦超过即停。
 */
function rankFor(score) {
  const s = Math.max(0, Number(score) || 0)
  let tier = RANK_TIERS[0]
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].threshold <= s) tier = RANK_TIERS[i]
    else break
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
  const [rows] = await query("SELECT NOW() AS `now`, VERSION() AS version")
  return rows[0]
}

/** 关闭连接池（用于 graceful shutdown / 测试 teardown） */
async function close() {
  if (_pool) {
    try { await _pool.end() } catch (e) { /* swallow */ }
    _pool = null
  }
}

module.exports = {
  getPool: getPool,
  query: query,
  getConnection: getConnection,
  healthCheck: healthCheck,
  close: close,
  RANK_TIERS: RANK_TIERS,
  rankFor: rankFor
}
