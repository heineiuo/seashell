var seashell = require('../src/seashell')

seashell.connect({
  "url": 'ws://127.0.0.1:3000',
  "key": {
    "appId": "285fb8f6-046f-403f-807f-344c8722741d",
    "appName": "account",
    "appSecret": "da5698be17b9b46962335799779fbeca8ce5d491c0d26243bafef9ea1837a9d8"
  }
}, function (err, data) {
  if (err) {
    console.log(err)
    throw err
  }
})

seashell.exportService('example', function (requestData, callback) {
  var resultData = {
    username: "哈哈"
  }
  callback(resultData)
})