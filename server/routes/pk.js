var express = require("express")
var db = require("../db")
var router = express.Router()

router.post("/submit", async function (req, res, next) {
  var body = req.body || {}
  var openid = body.openid
  var nickname = body.nickname
  var avatar_url = body.avatar_url
  var s = Number(body.score)
  var t = Number(body.total)
  var d = Number(body.delta != null ? body.delta : 0)

  if (typeof openid !== "string" || !openid || openid.length > 64) {
    return res.status(400).json({ error: "invalid openid" })
  }
  if (!Number.isFinite(s) || s < 0 || s > 1000) {
    return res.status(400).json({ error: "invalid score" })
  }
  if (!Number.isFinite(t) || t < 1 || t > 100) {
    return res.status(400).json({ error: "invalid total" })
  }
  if (!Number.isFinite(d) || d < -200 || d > 200) {
    return res.status(400).json({ error: "invalid delta" })
  }

  var conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    await conn.query(
      "INSERT INTO users (openid, nickname, avatar_url, last_active_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nickname = COALESCE(VALUES(nickname), nickname), avatar_url = COALESCE(VALUES(avatar_url), avatar_url), last_active_at = NOW()",
      [openid, nickname || null, avatar_url || null]
    )

    var [oldRows] = await conn.query(
      "SELECT score, `rank` FROM leaderboard WHERE openid = ?",
      [openid]
    )
    var oldScore = oldRows.length > 0 ? oldRows[0].score : 0
    var oldRank = oldRows.length > 0 ? oldRows[0].rank : "bronze"

    var newScore = Math.max(0, oldScore + d)
    var newRank = db.rankFor(newScore)
    var isWin = s >= 60

    await conn.query(
      "INSERT INTO leaderboard (openid, nickname, avatar_url, score, `rank`, total_matches, wins) VALUES (?, ?, ?, ?, ?, 1, ?) ON DUPLICATE KEY UPDATE nickname = COALESCE(VALUES(nickname), nickname), avatar_url = COALESCE(VALUES(avatar_url), avatar_url), score = VALUES(score), `rank` = VALUES(`rank`), total_matches = total_matches + 1, wins = wins + VALUES(wins), updated_at = NOW()",
      [openid, nickname || null, avatar_url || null, newScore, newRank, isWin ? 1 : 0]
    )

    await conn.query(
      "INSERT INTO match_records (openid, score, total, delta, rank_before, rank_after) VALUES (?, ?, ?, ?, ?, ?)",
      [openid, s, t, d, oldRank, newRank]
    )

    await conn.commit()

    res.json({
      score: s,
      rankChange: d,
      rank_before: oldRank,
      rank_after: newRank,
      new_total_score: newScore,
      tier: newRank,
      is_win: isWin
    })
  } catch (e) {
    await conn.rollback().catch(function () {})
    next(e)
  } finally {
    conn.release()
  }
})

module.exports = router
