var Service = require('./model/Service')
var Online = require('./model/Online')
var Event = require('./model/Event')

var io = require('socket.io')()
io.on('connection', function(socket){
  //var io = socket.server
  //var eio = io.eio
  //var clients = Object.keys(eio.clients)
  //io.clients[socketId].send()

  console.log('new connection '+socket.id)

  socket.on('import', function (data) {
    console.log('import/require/request')
    var importAppName = data.importAppName
    console.log('import:'+importAppName)
    if (!data.callbackId) throw Error('Import Lost Prams Id: [callbackId]')
    Online.findOne({socketId: socket.id}, function (err, doc) {
      if(err) throw err

      if (!doc) {
        data.result = {
          error: "service not registered!"
        }
        return socket.emit('export', data)
      }
      data.appId = doc.appId

      Online.findOne({appName: importAppName}, function (err, doc) {
        //var targetSocket = io.sockets.socket(doc.socketId)
        //var targetSocket = io.clients[doc.socketId]
        if(err) throw err
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

  socket.on('export', function (data) {
    console.log('export/reply')
    var callbackId = data.calllbackId
    if (!data.callbackId) throw Error('Export Lost Prams Id: [callbackId]')

    console.log(data)
    Online.findOne({appId: data.appId}, function (err, doc) {
      //var targetSocket = io.clients[doc.socketId]
      var targetSocket = io.sockets.connected[doc.socketId]
      targetSocket.emit('export', data)
    })
  })

  socket.on('register', function (data) {
    console.log('register')
    console.log(data)

    var insertData = {
      appId: data.appId,
      socketId: socket.id,
      appName: data.appName
    }

    Online.insert(insertData, function (err, doc) {
      console.log(doc)
      console.log('register success '+ doc.appName)
    })

  })

  socket.on('disconnect', function(){
    console.log(socket.id+' disconnected')
    Online.remove({socketId: socket.id}, {}, function (err, numRemoved) {
      console.log(err, numRemoved)
    })
  })

})

Online.remove({}, {multi: true}, function (err, numRemoved) {
  console.log(err, numRemoved)
  io.listen(3000)
})
