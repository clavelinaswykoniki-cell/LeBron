var express = require("express")
var db = require("../db")
var router = express.Router()

router.get("/", async function (req, res, next) {
  try {
    var raw = Number(req.query.limit)
    var limit = Math.min(100, Math.max(1, Number.isFinite(raw) ? raw : 50))
    var [rows] = await db.query(
      "SELECT openid, nickname, avatar_url, score, `rank` AS tier, total_matches, wins FROM leaderboard ORDER BY score DESC, updated_at ASC LIMIT ?",
      [limit]
    )
    var data = rows.map(function (row, i) {
      return Object.assign({ rank: i + 1 }, row)
    })
    res.json({ data: data, limit: limit, count: data.length })
  } catch (e) { next(e) }
})

module.exports = router
