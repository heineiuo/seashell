

seashell.connect(ioUrl, {
  appId: 'fdsakgasf',
  appName: 'account'
})

seashell.socket.on('import', function (requestData) {
  var callbackId = requestData.callbackId
  console.log(callbackId)
  var resultData = {
    appId: requestData.appId,
    callbackId: callbackId,
    username: "哈哈"
  }
  shclient.socket.emit('export', resultData)
})