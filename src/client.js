var EventEmitter = require('events')
var util = require('util')

var socketWrap = module.exports = {}
var importEmitterStack = {}
var MyEmitter = function(){
  EventEmitter.call(this)
}

util.inherits(MyEmitter, EventEmitter)

var register = function(ioUrl, options, callback){
  socketWrap.socket = require('socket.io-client')(ioUrl)
  socketWrap.socket.on('connect', function () {
    console.log('connected')
    console.log('start register')
    socketWrap.socket.emit('register', options)
  })
  socketWrap.socket.on('registerResponse', function (data) {
    if (typeof callback == 'function') callback(data)
  })
  socketWrap.socket.on('export', function (data) {
    importEmitterStack[data.callbackId].emit('event', data)
  })
  socketWrap.socket.on('disconnect', function () {
    console.log('disconnected')
  })
}

/**
 * import
 */
var request = function(serviceName, data, callback){
  if (!socketWrap.socket) return callback('socket isnt connected')
  var callbackId = 'a'+Date.now()
  importEmitterStack[callbackId] = new MyEmitter()
  console.log(importEmitterStack[callbackId])
  importEmitterStack[callbackId].on('event', function (data) {
    callback(null, data)
    delete importEmitterStack[callbackId]
    return null
  })
  data.importAppName = serviceName
  data.callbackId = callbackId
  socketWrap.socket.emit('import', data)
}


socketWrap.connect = register
socketWrap.register = register
socketWrap.request = request
socketWrap.import = request



