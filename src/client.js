const Emitter = require('./Emitter')
const md5 = require('./md5')

const Client = function () {

  const importEmitterStack = {}
  const exportActionStack = {}

  const client = {
    isStarted: false,
    isOnline: false
  }

  client.connect = function (opts, callback) {

    client.isStarted = true

    console.log(opts)

    const socket = client.socket = require('socket.io-client')(opts.url)

    socket.on('connect', function () {
      console.log('connected')
      console.log('start register')
      client.online = true
      socket.emit('register', opts.key)
    })
    socket.on('export', function (response) {
      importEmitterStack[response.callbackId].emit('importResponse', response)
    })
    socket.on('import', function (request) {
      console.log('handle request: '+JSON.stringify(request))
      exportActionStack[request.actionName](request, function (responseData) {
        socket.emit('export', {
          appId: request.appId,
          callbackId: request.callbackId,
          data: responseData
        })
      })
    })
    socket.on('disconnect', function () {
      client.online = false
      console.log('disconnected')
    })
    //
    //
    //if (typeof callback == 'function') {
    //  socket.on('registerResponse', function (data) {
    //    callback(data.error, data)
    //  })
    //} else {
    //  var called = false
    //  return new Promise(function (resolve, reject) {
    //    socket.on('registerResponse', function (data) {
    //      called = true
    //      if (data.error) {
    //        reject(data)
    //      } else {
    //        resolve(data)
    //      }
    //    })
    //  })
    //}
  }

  /**
   * import
   */
  client.import = function(serviceName, data, callback){
    if (!client.online) return callback({error: "YOUR_SERVICE_IS_OFFLINE"})
    var callbackId = md5(String(Math.random()+Date.now()))
    importEmitterStack[callbackId] = new Emitter()
    //console.log(importEmitterStack[callbackId])

    data.importAppName = serviceName
    data.callbackId = callbackId
    console.log('start request servicehub, data: '+JSON.stringify(data))
    client.socket.emit('import', data)

    if(typeof callback!='function'){
      return new Promise(function (resolve, reject) {
        importEmitterStack[callbackId].on('importResponse', function (response) {
          resolve(response)
          delete importEmitterStack[callbackId]
          return null
        })
      })
    } else {
      importEmitterStack[callbackId].on('importResponse', function (response) {
        callback(response)
        delete importEmitterStack[callbackId]
        return null
      })
    }
  }

  client.exportService = function (actionName, action) {
    exportActionStack[actionName] = action
  }

  return client

}

module.exports = Client()
