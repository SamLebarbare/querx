const fs = require("fs");
const Papa = require("papaparse");
const r = require("rethinkdb");
const watt = require("watt");
const vm = require("vm");

module.exports = watt(function* (
  cmd,
  host,
  port,
  queryFileName,
  querySrc,
  outputFilePath,
  next
) {
  console.log("(っ◕‿◕)っ rethinkdb ✨");
  console.log(`connecting to ${host}:${port}...`);
  let conn;
  try {
    conn = yield r.connect({ host, port }, next);
    console.log("connected ✨");
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
      timeout: 10000,
    });
    console.log("running query...");
    const data = yield* script.runInContext(context);
    console.log("done ✨");

    let content;
    switch (cmd) {
      case "json":
        content = JSON.stringify(data, null, 2);
        break;
      case "csv":
        content = Papa.unparse({
          data,
        });
        break;
    }

    console.log("writting file...");
    fs.writeFileSync(outputFilePath, content);
    console.log("file writed ✨");
    console.log(outputFilePath);
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) {
      console.log("disconnecting...");
      conn.removeAllListeners();
      yield conn.close({ noreplyWait: true }, next);
      console.log("querx disconnected ✨");
    }
  }
});
