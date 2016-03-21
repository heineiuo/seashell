var glob = require("glob")
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var watch = require('watch')
var Datastore = require('nedb')

var Server = function (opts) {

  var Service = new Datastore({
    filename: 'data/db/Service.db',
    autoload: true
  })

  var checkServiceFormat = function (serviceData) {
    if (typeof serviceData.appSecret != 'string') return false
    if (typeof serviceData.appName != 'string') return false
    return true
  }

  var addNewServiceByFilePath = function (filepath) {
    fs.readFile(filepath, 'UTF-8', function (err, data) {
      if (err) throw err
      try {
        var serviceData = JSON.parse(data)
      } catch(e){
        if (e) throw e
      }

      serviceData.appId = path.basename(filepath, '.json')
      serviceData.socketId = null
      serviceData.online = 0
      if (!checkServiceFormat(serviceData)) throw Error('Service Defination Format Error')
      Service.insert(serviceData, function (err, doc) {
        if (err) throw err
      })
    })
  }


  var updateServiceByFilePath = function (filepath) {
    fs.readFile(filepath, 'UTF-8', function (err, data) {
      if (err) throw err
      try {
        var serviceData = JSON.parse(data)
      } catch(e){
        if (e) throw e
      }

      var appId = path.basename(filepath, '.json')
      serviceData.socketId = null
      serviceData.online = 0
      if (!checkServiceFormat(serviceData)) throw Error('Service Defination Format Error')
      Service.update({appId: appId}, {$set: serviceData},{}, function (err, doc) {
        if (err) throw err
      })
    })
  }

  /****************
   *
   * INIT Service
   *
   **************/


  try {
    mkdirp.sync('data/service')
  } catch(e){
    throw new Error('File RW+ Permission Denied.')
  }

  Service.remove({}, {multi: true}, function (err, numRemoved) {
    if (err) throw err
    console.log(numRemoved)

    glob('data/service/**/*.json', {}, function (err, files) {
      if (err) throw err
      if (!files.length) console.warn('none service defination file found')
      files.forEach(function (item, index) {
        addNewServiceByFilePath(item)
      })

      watch.createMonitor('data/service', function (monitor) {
        monitor.on("created", function (f, stat) {
          if (path.extname(f) !== '.json') return null
          addNewServiceByFilePath(f)
        })
        monitor.on("changed", function (f, curr, prev) {
          updateServiceByFilePath(f)
        })
        monitor.on("removed", function (f, stat) {
          var appId = path.basename(f, '.json')
          Service.remove({appId: appId}, {}, function (err, numRemoved) {
            if (err) throw err
          })
        })
      })

    })

  })

  /*****************
   *
   * socket.io server monitor
   *
   ****************/

  var io = require('socket.io')()

  io.on('connection', function(socket){
    //var io = socket.server
    //var eio = io.eio
    //var clients = Object.keys(eio.clients)
    //io.clients[socketId].send()

    console.log('new connection '+socket.id)

    socket.on('register', function (data) {
      console.log('register')
      console.log(data)
      console.log(socket.id)
      if (!socket.id) throw new Error('socket.id undefined!')

      var insertData = {
        online: 1,
        appId: data.appId,
        socketId: socket.id,
        appSecret: data.appSecret
      }

      Service.findOne({
        appId: insertData.appId,
        appSecret: insertData.appSecret
      }, function (err, doc) {
        if (err) throw err
        if (!doc) return socket.emit('registerResponse', {error: "fail"})
        Service.update({appId: insertData.appId}, {$set: insertData}, {}, function (err, doc) {
          if (err) return socket.emit('registerResponse', {error: "fail"})
          socket.emit('registerResponse', {success: 1})
        })
      })

    })

    /**
     * 请求方
     */
    socket.on('import', function (data) {
      var importAppName = data.importAppName
      console.log('import:'+importAppName)
      if (!data.callbackId) throw Error('Import Lost Prams Id: [callbackId]')
      Service.findOne({socketId: socket.id}, function (err, doc) {
        if(err) throw err

        if (!doc) {
          data.result = {
            error: "service not registered!"
          }
          return socket.emit('export', data)
        }
        data.appId = doc.appId

        Service.findOne({
          online: 1,
          appName: importAppName,
        }, function (err, doc) {
          //var targetSocket = io.sockets.socket(doc.socketId)
          //var targetSocket = io.clients[doc.socketId]
          if (err) throw err
          if (!doc) {
            data.result = {
              error: "no target service avileable!"
            }
            return socket.emit('export', data)
          }
          var targetSocket = io.sockets.connected[doc.socketId]
          targetSocket.emit('import', data)
        })

      })
    })

    /**
     * 处理方处理结果 -> 请求方
     * @return result.appId 请求方的识别号
     * @return result.callbackId 请求方的请求识别号
     * @return result.data 真实结果
     */
    socket.on('export', function (result) {
      console.log('export/reply')
      if (!result.appId) throw Error('Export Lost Params: [appId]')
      if (!result.callbackId) throw Error('Export Lost Params: [callbackId]')
      var data = result.data
      Service.findOne({appId: result.appId}, function (err, doc) {
        if (err) throw err
        //var targetSocket = io.clients[doc.socketId]
        var targetSocket = io.sockets.connected[doc.socketId]
        if (targetSocket) targetSocket.emit('export', result)
      })
    })


    socket.on('disconnect', function(){
      console.log(socket.id+' disconnected')
      Service.update({socketId: socket.id}, {$set: {
        socketId: null,
        online: 0
      }}, {}, function (err, numRemoved) {
        console.log(err, numRemoved)
      })
    })

  })

  console.log('listening on port '+(opts.port||process.env.port||3300))
  io.listen(opts.port||process.env.port||3300)

}

module.exports = Server

