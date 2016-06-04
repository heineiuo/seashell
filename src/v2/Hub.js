import Base from './Base'
import glob from "glob"
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import watch from 'watch'
import Datastore from 'nedb-promise'
import SocketIO from 'socket.io'
import awaitify from '../util/awaitify'

class Hub extends Base {

  state = {}

  /**
   * 检查service格式
   * @return Promise
   */
  checkServiceFormat = (serviceData) =>{
    return new Promise(async (resolve, reject)=>{
      if (typeof serviceData.appSecret != 'string') return reject('Service Defination Format Error')
      if (typeof serviceData.appName != 'string') return reject('Service Defination Format Error')
      resolve(true)
    })
  }

  /**
   * 添加service配置
   * @param filepath
   */
  addNewServiceByFilePath = async (filepath) =>{
    const {Service} = this.state
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

  /**
   * 更新service配置
   * @param filepath
   */
  updateServiceByFilePath = async (filepath)=> {
    const {Service} = this.state
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

  /**
   * 清空service
   * @returns Promise
   */
  empty = ()=> {
    const {Service} = this.state
    return Service.remove({}, {multi: true})
  }

  /****************
   *
   * INIT Service
   *
   **************/
  start = async (opts)=>{
    if (this.state.isStarted) return false
    const Hub = this
    const {
      addNewServiceByFilePath,
      updateServiceByFilePath
    } = this

    try {
      const Service = new Datastore({
        filename: 'data/db/Service.db',
        autoload: true
      })
      const io = SocketIO()
      this.setState({
        Service: Service,
        io: io,
        opts: opts
      })
      mkdirp.sync('data/service')
      await Hub.empty()
      const files = await awaitify(glob)('data/service/**/*.json', {})

      if (!files.length) console.warn('none service defination file found')
      files.forEach((item, index)=> {
        addNewServiceByFilePath(item)
      })

      watch.createMonitor('data/service', (monitor)=> {
        monitor.on("created", (filePath, stat) =>{
          if (path.extname(filePath) !== '.json') return null
          addNewServiceByFilePath(filePath)
        })
        monitor.on("changed", (filePath, curr, prev)=> {
          updateServiceByFilePath(filePath)
        })
        monitor.on("removed", (filePath, stat) => {
          var appId = path.basename(filePath, '.json')
          Service.remove({appId: appId}, {}, (err, numRemoved) =>{
            if (err) throw err
          })
        })
      })

      /*****************
       *
       * socket.io server monitor
       *
       ****************/
      io.on('connection',(socket)=>{
        console.log('new connection '+socket.id)
        socket.on('register', (data)=> {
          Hub.handleRegister(socket, data)
        })
        socket.on('import', (request)=>{
          Hub.handleRequest(socket, request)
        })
        socket.on('export',  (response)=>{
          Hub.handleResponse(socket, response)
        })

        /**
         * 断开连接
         */
        socket.on('disconnect',()=>{
          console.log(socket.id+' disconnected')
          Service.update({socketId: socket.id}, {$set: {
            socketId: null,
            online: 0
          }}, {}, console.log)
        })
      })

      console.log('listening on port '+(opts.port||process.env.port||3300))
      io.listen(opts.port||process.env.port||3300)
    } catch(e){
      throw new Error('File RW+ Permission Denied.')
    }
  }

  /**
   * 接收来自APP的请求
   * 1. 获取请求信息
   * 2. 验证APP
   * 3. 分派给处理APP
   */
  handleRequest = async (socket, request)=>{
    const {Service, io} = this
    console.log('import:'+JSON.stringify(request))
    var response = {
      callbackId: request.callbackId,
      data: {}
    }

    try {
      var importAppName = request.importAppName
      if (!request.callbackId) {
        response.data = {error: 'LOST_CALLBACKID'}
        return socket.emit('export', response)
      }
      const doc = await Service.findOne({socketId: socket.id})
      response.appId = request.appId = doc.appId
      const service = await Service.findOne({
        online: 1,
        appName: importAppName,
      })
      if (!service) throw new Error("TARGET_SERVICE_OFFLINE")
      io.sockets.connected[service.socketId].emit('import', request)
    } catch(e){
      response.data = {error: e}
      return socket.emit('export', response)
    }
  }

  /**
   * 处理APP返回响应数据包
   * @return response.appId 请求方的识别号
   * @return response.callbackId 请求方的请求识别号
   * @return response.data 真实结果
   */
  handleResponse = async (socket, response) =>{
    try {
      const {Service, io} = this.state
      console.log('export/reply')
      if (!response.appId) throw new Error('Export Lost Params: [appId]')
      if (!response.callbackId) throw new Error('Export Lost Params: [callbackId]')
      const doc = await Service.findOne({appId: response.appId})
      var targetSocket = io.sockets.connected[doc.socketId]
      if (targetSocket) targetSocket.emit('export', response)
    } catch(e){
      console.error(e)
    }
  }

  /**
   * 注册服务
   * @param socket
   * @param data
   * @returns {Emitter|Namespace|Socket|*}
   */
  handleRegister = async (socket, data)=>{
    const {Service, io} = this.state
    console.log('register')
    console.log(data)
    console.log(socket.id)
    try {
      if (!socket.id) {
        console.log('[EXCEPTION] LOST SOCKET ID')
        return socket.emit('registerResponse', {error: "EXCEPTION_ERROR"})
      }
      var insertData = {
        online: 1,
        appId: data.appId,
        socketId: socket.id,
        appSecret: data.appSecret
      }
      const doc = await Service.findOne({
        appId: insertData.appId,
        appSecret: insertData.appSecret
      })
      if (!doc) return socket.emit('registerResponse', {error: "PERMISSION_DENIED"})
      const newDoc = await Service.update({appId: insertData.appId}, {$set: insertData}, {})
      socket.emit('registerResponse', {success: 1})
    } catch(e){
      socket.emit('registerResponse', {error: "EXCEPTION_ERROR"})
    }
  }
}

export default Hub