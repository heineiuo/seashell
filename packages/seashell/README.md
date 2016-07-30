#Seashell


[![npm version](https://img.shields.io/npm/v/seashell.svg?style=flat-square)](https://www.npmjs.com/package/seashell)
[![NPM Status](http://img.shields.io/npm/dm/seashell.svg?style=flat-square)](https://www.npmjs.org/package/seashell)
[![Build Status](http://img.shields.io/travis/heineiuo/seashell/master.svg?style=flat-square)](https://travis-ci.org/heineiuo/seashell)

Create socket pool to require denpendent services easily.

## DEMO

Run each script in `demo` dir, and browser `localhost:3001`.

## Install

Use cli tool:
```shell
$ npm install seashell-cli -g
$ mkdir service; cd service; seashell init
$ npm install
$ node server
```

Or add to project manally:
```javascript
$ npm install seashell --save

// create hub.js
var seashell = require('seashell')
seashell.Server()
```


## DONATE

[![Hansel's Gratipay](https://img.shields.io/gratipay/heineiuo.svg)](https://gratipay.com/~heineiuo/)


## LICENSE

MIT License.
