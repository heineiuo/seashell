#Seashell

Create socket pool to require denpendent services easily.
---

## Install

Use cli tool:
```
npm install seashell-cli -g
mkdir service; cd service; seashell init
npm install
node server
```

Or add to project manally:
```
npm install seashell --save

// create server.js
var seashell = require('seashell')
seashell.Server()
```

## LICENSE

MIT License.
