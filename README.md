# Seashell

[![Join the chat at https://gitter.im/heineiuo/seashell](https://badges.gitter.im/heineiuo/seashell.svg)](https://gitter.im/heineiuo/seashell?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/seashell.svg?style=flat-square)](https://www.npmjs.com/package/seashell)
[![NPM Status](http://img.shields.io/npm/dm/seashell.svg?style=flat-square)](https://www.npmjs.org/package/seashell)
[![Build Status](http://img.shields.io/travis/heineiuo/seashell/master.svg?style=flat-square)](https://travis-ci.org/heineiuo/seashell)

A message queue for node.js and javascript.

The master branch is in a fast iteration state, please use branch [v0.6.x](https://github.com/heineiuo/seashell/tree/v0.6.x) for stable usage.

---


## get started

```javascript
$ npm install seashell --save

// create hub.js
import {Hub} from 'seashell'

const hub = new Hub()
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

## class

use class to create instance.

### Router

```javascript
const router = new Router()
```

### App

*App extends from Router*

```javascript
const app = new App()
```

### Hub

```javascript
const hub = new Hub()
```

## API

### router.use(path, (req, res, next)=>{})

```javascript
router.use('/', (req, res, next) => {
    console.log(req.body)
    next() // will run next middleware
})

router.use('/', (req, res, next) => {)
    res.body = {hello: 'world'} // res.body will sending to request client
    res.end() // tell app to stop middleware and send response data
}
```

### router.use(router)

```javascript
const router = new Router()
router.use('abc', (req, res, next)=>{
    res.body = {success: 1}
    res.end()
})

const router2 = new Router()

router2.use('test', router)


// now , clients can request 'SERVICENAME/test/abc' and
got response '{"success": 1}'

```

### app.use(router)

just like `router.use`

### app.connect(options)

```javascript
app.connect({
    // options here
})
```

### app.request(url, requestBody)


```javascript

// write in async/await
const response = app.request('/account/profile', {userId: 1})
console.log(response.body) // {profile: {name: 'hansel', gender: 'man'}}

// write in Promise
app.request('/account/profile', {userId: 1})
    .then((response)=>{
        console.log(response.body)
    })

// account means app's appName, defined in key. sea demo/data/service
// /profile means app's router, defined in app

```

### hub.start()

```javascript
const hub = new Hub()
hub.start()

// now, clients can connect hub on port 3311(default port)


```

## Demo

Run each script in `demo` dir, and browser `localhost:3001`.




## Use cli tool

```shell
$ npm install seashell-cli -g
$ seashell -k // will create a key like example in demo/service.
```


## Todo

- [x] Promise
- [x] connect
- [x] request
- [ ] log
- [ ] custom hub port

## Donate

[![Hansel's Gratipay](https://img.shields.io/gratipay/heineiuo.svg)](https://gratipay.com/~heineiuo/)


## Contact 

QQ Group: 310433696


## LICENSE

MIT License.
