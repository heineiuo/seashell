var app = require('express')()
var http = require('http').Server(app)
var seashell = require('../src')

app.use(function(req, res, next){
  if (seashell.socket) return next()
  seashell.connect('ws://127.0.0.1:3000', {
    "appId": "01b257a9-08af-475d-a686-e8eab6026c1c",
    "appName": "api",
    "appSecret": "da5698be17b9b46962335799779fbeca8ce5d491c0d26243bafef9ea1837a9d8"
  }, function (err) {
    if (!err) return next()
    console.log(err)
    res.write("service unavailable now, fresh page again.")
    res.end()
  })
})

app.use(function(req, res, next){
  var data = {
    foo: "bar",
    actionName: 'example'
  }

  seashell.import('account', data, function(err, data){
    if (err) {
      res.write(JSON.stringify(err))
      return res.end()
    }
    console.log(data)
    res.write(JSON.stringify(data))
    res.end()
  })

})

http.listen(3001, function () {
  console.log('listing on port 3001')
})

