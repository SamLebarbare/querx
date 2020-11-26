# Querx

Querx perform scripted rethinkdb queries and export results as
json or csv.

## Usage

```bash
npx querx json ./players.js /tmp/output.json
```

```js
//players.js
const q = r.db('game').table('players');
const cursor = yield q.run(con, next);
return yield cursor.toArray(next);
```

## Script scope/context

| reference |                              |
| --------- | :--------------------------: |
| con       |  rethinkdb connection object |
| r         |  rethinkdb r query object    |
| dir       |  function like console.dir   |
| next      |  callback for async calls    |

## Limitations

- Your script must return an Array of results
- Use vanilla rethinkdb driver

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](https://choosealicense.com/licenses/isc/)
