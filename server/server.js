var express = require("express")
var cors = require("cors")
var db = require("./db")

var app = express()
app.use(cors())
app.use(express.json({ limit: "32kb" }))

app.use(function (req, res, next) {
  var t0 = Date.now()
  res.on("finish", function () {
    console.log("[" + new Date().toISOString() + "] " + req.method + " " + req.originalUrl + " -> " + res.statusCode + " " + (Date.now() - t0) + "ms")
  })
  next()
})

app.get("/", function (req, res) {
  res.json({ service: "lebron-api", ok: true })
})

app.get("/health", async function (req, res) {
  try {
    var info = await db.healthCheck()
    res.json({ ok: true, db: info })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

app.use("/api/leaderboard", require("./routes/leaderboard"))
app.use("/api/pk", require("./routes/pk"))
app.use("/api/daily", require("./routes/daily"))
app.use("/api/llm", require("./routes/llm"))

app.use(function (req, res) {
  res.status(404).json({ error: "not found", path: req.originalUrl })
})

app.use(function (err, req, res, next) {
  console.error("[err]", err.stack || err.message)
  res.status(err.status || 500).json({ error: err.message || "internal error" })
})

var port = Number(process.env.PORT || 80)
var server = app.listen(port, function () {
  console.log("[lebron-server] listening on port " + port)
})

function shutdown() {
  console.log("[lebron-server] shutting down")
  server.close(function () { process.exit(0) })
}
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
