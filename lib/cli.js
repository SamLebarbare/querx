const pack = require("../package.json");
const yargs = require("yargs");
const argv = yargs
  .scriptName("querx")
  .usage(
    `✨ Querx (v${pack.version}) ✨

Usage:

querx query.js /tmp/result.csv

example query.js file:

 const q = r.db('game').table('players');
 const cursor = q.run(con, next);
 return yield cursor.toArray(next);

script context:
 
 dir -> simple console.dir
 r -> rethinkdb query driver
 con -> rethinkdb connection object
 next -> a callback to yield for async call
`
  )
  .command(
    "run <queryFile> <outputFile>",
    "Execute query script and export results as csv",
    {
      queryFile: {
        alias: "queryFile",
      },
      outputFile: {
        alias: "outputFile",
      },
    }
  )
  .example(
    "$0 run query.js /tmp/result.csv",
    "run query.js and export result in output file"
  )
  .option("host", {
    alias: "h",
    type: "string",
    description: "hostname",
    default: "127.0.0.1",
  })
  .option("port", {
    alias: "p",
    type: "number",
    description: "port",
    default: 28015,
  })
  .help()
  .epilog("Made with 🧀 by SamLeBarbare (Epsitec SA)")
  .demandCommand(1, "").argv;

const fs = require("fs");
const path = require("path");
const { resolve } = path;

const queryFilePath = resolve(process.cwd(), argv.queryFile);
const outputFilePath = resolve(process.cwd(), argv.outputFile);
if (!fs.existsSync(queryFilePath)) {
  console.error(`Unable to locate ${queryFilePath} file`);
  return;
}

const queryJS = fs.readFileSync(queryFilePath);
const run = require("./rethinkdb.js");
run(argv.host, argv.port, queryFilePath, queryJS, outputFilePath);
