const fs = require("fs");
const os = require("os");
const path = require("path");
const Papa = require("papaparse");
const r = require("rethinkdb");
const watt = require("watt");
const host = "localhost";
const db = "vcy";
const tmpFilePath = path.join(os.tmpdir(), "export.csv");
watt(function*(next) {
  console.log("connecting..");
  const conn = yield r.connect({ host, db }, next);
  console.log("connected!");

  const q = r
    .db("vcy")
    .table("document")
    .pluck(
      "reference",
      { meta: { summaries: ["customer"], status: true } },
      "hasErrors",
      "startDate",
      "endDate",
      "status",
      { sums: { base: true } }
    )
    .map(function(d) {
      return {
        customer: d("meta")("summaries")("customer"),
        reference: d("reference"),
        total: d("sums")("base"),
        from: d("startDate"),
        to: d("endDate"),
        state: d("status"),
        status: d("meta")("status")
      };
    });

  const cursor = yield q.run(conn, next);
  console.log("running query...");
  const data = yield cursor.toArray(next);
  console.log("done!");
  const rows = Papa.unparse({
    data
  });
  console.log("writting file...");
  fs.writeFileSync(tmpFilePath, rows);
  console.log("file writed!");
  console.log(tmpFilePath);
  console.log("disconnecting...");
  conn.removeAllListeners();
  yield conn.close({ noreplyWait: true }, next);
  console.log("disconnected!");
})();
