var EventEmitter = require('events')
var util = require('util')

var socketWrap = module.exports = {
  isStarted: false,
  isOnline: false
}
var importEmitterStack = {}
var exportActionStack = {}

var md5 = function (tobeHash) {
  return require('crypto')
    .createHash('md5')
    .update(tobeHash)
    .digest('hex')
}

var MyEmitter = function(){
  EventEmitter.call(this)
}

util.inherits(MyEmitter, EventEmitter)

var register = function(ioUrl, options, callback){
  socketWrap.isStarted = true
  socketWrap.socket = require('socket.io-client')(ioUrl)
  socketWrap.socket.on('connect', function () {
    console.log('connected')
    console.log('start register')
    socketWrap.online = true
    socketWrap.socket.emit('register', options)
  })
  socketWrap.socket.on('registerResponse', function (data) {
    if (typeof callback == 'function') callback(data.error, data)
  })
  socketWrap.socket.on('export', function (response) {
    importEmitterStack[response.callbackId].emit('importResponse', response)
  })
  socketWrap.socket.on('import', function (request) {
    exportActionStack[request.actionName](request, function (responseData) {
      socketWrap.socket.emit('export', {
        appId: request.appId,
        callbackId: request.callbackId,
        data: responseData
      })
    })
  })
  socketWrap.socket.on('disconnect', function () {
    socketWrap.online = false
    console.log('disconnected')
  })

}

/**
 * import
 */
var request = function(serviceName, data, callback){
  if (!socketWrap.online) return callback({error: "YOUR_SERVICE_IS_OFFLINE"})
  var callbackId = md5(String(Math.random()+Date.now()))
  importEmitterStack[callbackId] = new MyEmitter()
  //console.log(importEmitterStack[callbackId])
  importEmitterStack[callbackId].on('importResponse', function (response) {
    callback(response)
    delete importEmitterStack[callbackId]
    return null
  })
  data.importAppName = serviceName
  data.callbackId = callbackId
  socketWrap.socket.emit('import', data)
}


var exportService = function (actionName, action) {
  exportActionStack[actionName] = action
}

socketWrap.isOnline = function () {return socketWrap.isOnline}
socketWrap.isStarted = function () {return socketWrap.isStarted}
socketWrap.connect = socketWrap.register = register
socketWrap.request = socketWrap.import = request
socketWrap.exportService = exportService