const pack = require("../package.json");
const yargs = require("yargs");
const argv = yargs
  .scriptName("querx")
  .usage(
    `✨ querx (っ◕‿◕)っ (v${pack.version}) ✨

Usage:

querx csv query.js /tmp/result.csv

querx json query.js /tmp/result.json

example query file:

 //players.js
 const q = r.db('game').table('players');
 const cursor = q.run(con, next);
 return yield cursor.toArray(next);

available in script context:
 
 dir -> simple console.dir
 r -> rethinkdb query driver
 con -> rethinkdb connection object
 next -> a callback to yield for async call
`
  )
  .command(
    "csv <queryFile> <outputFile>",
    "Execute query script and export as a flat csv file",
    {
      queryFile: {
        alias: "queryFile",
      },
      outputFile: {
        alias: "outputFile",
      },
    }
  )
  .command(
    "json <queryFile> <outputFile>",
    "Execute query script and export as json file",
    {
      queryFile: {
        alias: "queryFile",
      },
      outputFile: {
        alias: "outputFile",
      },
    }
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

const cmd = argv._[0];
switch (cmd) {
  case "json":
  case "csv":
    break;
  default:
    console.error(`Unknow command: ${cmd}`);
    return -1;
}

const fs = require("fs");
const path = require("path");
const { resolve } = path;

const queryFilePath = resolve(process.cwd(), argv.queryFile);
const outputFilePath = resolve(process.cwd(), argv.outputFile);
if (!fs.existsSync(queryFilePath)) {
  console.error(`Unable to locate ${queryFilePath} file`);
  return -1;
}

const queryJS = fs.readFileSync(queryFilePath);
const run = require("./rethinkdb.js");
run(cmd, argv.host, argv.port, queryFilePath, queryJS, outputFilePath);
