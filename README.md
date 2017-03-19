# Seashell

[![Join the chat at https://gitter.im/heineiuo/seashell](https://badges.gitter.im/heineiuo/seashell.svg)](https://gitter.im/heineiuo/seashell?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/seashell.svg?style=flat-square)](https://www.npmjs.com/package/seashell)
[![NPM Status](http://img.shields.io/npm/dm/seashell.svg?style=flat-square)](https://www.npmjs.org/package/seashell)
[![Build Status](http://img.shields.io/travis/heineiuo/seashell/master.svg?style=flat-square)](https://travis-ci.org/heineiuo/seashell)

A message queue for node.js and javascript.

The master branch is in a fast iteration state, please use branch [v0.6.x](https://github.com/heineiuo/seashell/tree/v0.6.x) for stable usage.

---

## Document

[Server API](./docs/API/Server.md)
[Client API](./docs/API/Client.md)

## Examples

We have some examples in examples directory.

```javascript
$ npm install seashell --save

// create hub.js
import Seashell from 'seashell'

const hub = new Seashell()
hub.start()

// create app.js
import {App, Router} from 'seashell'

const config = {
  url: "ws://127.0.0.1:3311",
  key: {
    appId: "", // see example in demo/service
    appName: "",
    appSecret: ""
  }
}
app.connect(config)

```

## Command Line Tool

```shell
$ npm install seashell-cli -g
$ seashell -k // will create a key like example in demo/service.
```


## Road Map

* Streaming support.
* Index Service support.


## Community

QQ Group: 310433696


## LICENSE

MIT License.
