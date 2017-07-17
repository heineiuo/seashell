# Seashell

[![Join the chat at https://gitter.im/heineiuo/seashell](https://badges.gitter.im/heineiuo/seashell.svg)](https://gitter.im/heineiuo/seashell?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/seashell.svg?style=flat-square)](https://www.npmjs.com/package/seashell)
[![NPM Status](http://img.shields.io/npm/dm/seashell.svg?style=flat-square)](https://www.npmjs.org/package/seashell)
[![Build Status](http://img.shields.io/travis/heineiuo/seashell/master.svg?style=flat-square)](https://travis-ci.org/heineiuo/seashell)

A message framework, a high-level communication protocol for node.js and javascript.

The master branch is in a fast iteration state, please use branch [v0.6.x](https://github.com/heineiuo/seashell/tree/v0.6.x) for stable usage.

---

## Document

[Server API](./docs/API/Server.md)
[Client API](./docs/API/Client.md)

## Examples

We have some examples in examples directory.

```javascript
$ npm install seashell --save

// server
import Seashell from 'seashell'

const seashell = new Seashell();

seashell.use('/api', ctx => {
  ctx.response.body = {...};
  ctx.response.end()
})

seashell.listen(3333);

// client
import {App, Router} from 'seashell/lib/client'

app.connect('ws://127.0.0.1:3333?appId=APPID&appName=APPNAME&appSecret=APPSECRET');

app.request('/seashell/api');

```

## Command Line Tool

```shell
$ npm install seashell-cli -g
$ seashell proxy src/index.js # Start a http server to proxy seashell app.
```


## Road Map

* Streaming support.


## Community

QQ Group: 310433696


## LICENSE

MIT License.
