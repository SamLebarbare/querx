const fs = require("fs");
const Papa = require("papaparse");
const r = require("rethinkdb");
const watt = require("watt");
const vm = require("vm");

function captureStdout(callback) {
  var output = "",
    old_write = process.stdout.write;

  // start capture
  process.stdout.write = function (str, encoding, fd) {
    output += str;
  };

  callback();

  // end capture
  process.stdout.write = old_write;

  return output;
}

module.exports = watt(function* (
  host,
  port,
  queryFileName,
  querySrc,
  outputFilePath,
  next
) {
  console.log(`connecting to ${host}:${port}...`);
  let conn;
  try {
    conn = yield r.connect({ host, port }, next);
    console.log("✨ connected!");
    const context = {
      dir: (a) => console.dir(a),
      con: conn,
      r,
      next,
    };
    vm.createContext(context);

    const runnable = `(function*(dir,con,r,next){
      ${querySrc}
    })(dir,con,r,next);`;
    const script = new vm.Script(runnable, {
      filename: queryFileName,
      lineOffset: 1,
      columnOffset: 1,
      displayErrors: true,
      timeout: 1000,
    });
    console.log("running query...");
    const data = yield* script.runInContext(context);
    console.log("✨ done!");
    const rows = Papa.unparse({
      data,
    });
    console.log("writting file...");
    fs.writeFileSync(outputFilePath, rows);
    console.log("✨ file writed!");
    console.log(outputFilePath);
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) {
      console.log("disconnecting...");
      conn.removeAllListeners();
      yield conn.close({ noreplyWait: true }, next);
      console.log("disconnected!");
    }
  }
});
