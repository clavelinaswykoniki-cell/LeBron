var express = require("express")
var db = require("../db")
var router = express.Router()

router.post("/checkin", async function (req, res, next) {
  var body = req.body || {}
  var openid = body.openid
  var card_id = body.card_id

  if (typeof openid !== "string" || !openid || openid.length > 64) {
    return res.status(400).json({ error: "invalid openid" })
  }
  if (card_id != null && (typeof card_id !== "string" || card_id.length > 64)) {
    return res.status(400).json({ error: "invalid card_id" })
  }

  var conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    var [todayRows] = await conn.query(
      "SELECT streak_days, checkin_date, card_id FROM checkins WHERE openid = ? AND checkin_date = CURDATE()",
      [openid]
    )
    if (todayRows.length > 0) {
      await conn.commit()
      var r = todayRows[0]
      return res.json({
        already_checked_in: true,
        streak_days: r.streak_days,
        checkin_date: r.checkin_date,
        card_id: r.card_id
      })
    }

    var [yRows] = await conn.query(
      "SELECT streak_days FROM checkins WHERE openid = ? AND checkin_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)",
      [openid]
    )
    var streak = yRows.length > 0 ? yRows[0].streak_days + 1 : 1

    await conn.query(
      "INSERT INTO checkins (openid, checkin_date, card_id, streak_days) VALUES (?, CURDATE(), ?, ?)",
      [openid, card_id || null, streak]
    )

    await conn.commit()

    res.json({
      already_checked_in: false,
      streak_days: streak,
      checkin_date: new Date().toISOString().slice(0, 10),
      card_id: card_id || null
    })
  } catch (e) {
    await conn.rollback().catch(function () {})
    next(e)
  } finally {
    conn.release()
  }
})

module.exports = router
