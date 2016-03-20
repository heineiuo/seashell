var app = require('express')()
var http = require('http').Server(app)
//var ioUrl = 'http://127.0.0.1:3000'
var ioUrl = 'http://115.28.70.224:3300'
var shclient = require('../src/index')

app.use(function(req, res, next){
  if (shclient.socket) return next()
  res.sendStatus(503)
  shclient.connect(ioUrl, {
    appId: 'aadfadfa',
    appName: 'normal',
    appSecret: 'fdaghakdhfkah213'
  })
})

app.use(function(req, res, next){
  var data = {foo: "bar"}

  shclient.import('account', data, function(err, data){
    if (err) {
      res.write(err)
      return res.end()
    }
    console.log(data)
    res.write(JSON.stringify(data))
    res.end()
  })

})

http.listen(3001)

