# Seashell

[![Join the chat at https://gitter.im/heineiuo/seashell](https://badges.gitter.im/heineiuo/seashell.svg)](https://gitter.im/heineiuo/seashell?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/seashell.svg?style=flat-square)](https://www.npmjs.com/package/seashell)
[![NPM Status](http://img.shields.io/npm/dm/seashell.svg?style=flat-square)](https://www.npmjs.org/package/seashell)
[![Build Status](http://img.shields.io/travis/heineiuo/seashell/master.svg?style=flat-square)](https://travis-ci.org/heineiuo/seashell)

Implement HTTP protocol over WebSocket. Used for NAT, proxy server and others. 


---

## Document

#### SeashellGateway

```js
import { SeashellGateway } from 'seashell'

const gateway = new SeashellGateway(( req, res ) => {
  res.write('Hello World from gateway server')
  res.end()
})

gateway.listen(3333)
```

#### SeashellClient

```js
import { SeashellClient } from 'seashell'

const client = new SeashellClient(( req, res ) => {
  res.write('Hello World from client')
  res.end()
}, {
  serverAddress: 'ws://127.0.0.1:3333?appId=APPID&appName=APPNAME&appSecret=APPSECRET'
})
```



## Contact

QQ Group: 310433696


## LICENSE

MIT License.
