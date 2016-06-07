import Base from './Base'
import glob from "glob-promise"
import path from 'path'
import fs from 'fs-promise'
import mkdirp from 'mkdirp'
import watch from 'watch'
import Datastore from 'nedb-promise'
import SocketIO from 'socket.io'

class Hub extends Base {

  state = {}

  /**
   * check service's format
   * @return Promise
   */
  checkServiceFormat = (serviceData) =>{
    return new Promise(async (resolve, reject)=>{
      if (typeof serviceData.appSecret != 'string')
        return reject('Service Defination Format Error')
      if (typeof serviceData.appName != 'string')
        return reject('Service Defination Format Error')
      resolve(true)
    })
  }

  /**
   * add a new service config file
   * @param filepath
   */
  addNewServiceByFilePath = async (filepath) =>{
    try {
      if (path.extname(filepath) !== '.json')
        throw new Error('file extname must be `json`!')
      const {checkServiceFormat} = this
      const {Service} = this.state
      const data = await fs.readFile(filepath, 'UTF-8')
      const serviceData = JSON.parse(data)
      serviceData.appId = path.basename(filepath, '.json')
      serviceData.socketId = null
      serviceData.online = 0
      if (!checkServiceFormat(serviceData))
        throw new Error('Service Defination Format Error')
      await Service.insert(serviceData)
    } catch(e){
      console.error(e)
    }
  }

  /**
   * update a service config
   * @param filepath
   */
  updateServiceByFilePath = async (filepath)=> {
    try {
      const {Service} = this.state
      const {checkServiceFormat} = this
      const data = fs.readFile(filepath, 'UTF-8')
      const serviceData = JSON.parse(data)
      const appId = path.basename(filepath, '.json')
      serviceData.socketId = null
      serviceData.online = 0
      if (!await checkServiceFormat(serviceData))
        throw Error('Service Defination Format Error')
      await Service.update({appId: appId}, {$set: serviceData},{})
    } catch(e){
      console.error(e)
    }
  }

  /**
   * remove a service config file
   * @param filePath
   */
  removeServiceByFilePath = async (filePath) => {
    const {Service} = this.state
    var appId = path.basename(filePath, '.json')
    await Service.remove({appId: appId}, {})
  }

  /**
   * empty all services
   * @returns Promise
   */
  empty = async ()=> {
    try {
      const {Service} = this.state
      await Service.remove({}, {multi: true})
    } catch(e){
      console.error(e)
    }
  }

  /**
   * receive request from a service
   * 1. get request data
   * 2. validate service permission
   * 3. pipe request to target service
   */
  handleRequest = async (socket, request)=>{
    const {Service, io} = this.state
    console.log('import:'+JSON.stringify(request))
    var response = {
      callbackId: request.callbackId,
      data: {}
    }

    try {
      if (!request.callbackId) throw new Error('LOST_CALLBACKID')

      var importAppName = request.importAppName
      const doc = await Service.findOne({socketId: socket.id})
      response.appId = request.appId = doc.appId
      const service = await Service.findOne({
        online: 1,
        appName: importAppName,
      })
      if (!service) throw new Error("TARGET_SERVICE_OFFLINE")
      io.sockets.connected[service.socketId]
        .emit('PLEASE_HANDLE_THIS_REQUEST', request)
      console.log(`hub emit client ${importAppName} to handle request ${request.actionName}`)
    } catch(e){
      console.log(e)
      response.data = {error: e}
      return socket.emit('YOUR_REQUEST_HAS_RESPONSE', response)
    }
  }

  /**
   * handle `callback`
   * @return response.appId `response header's service id`
   * @return response.callbackId `callbackId`
   * @return response.data `response body`
   */
  handleResponse = async (socket, response) => {
    const {Service, io} = this.state

    try {
      if (!response.appId)
        throw new Error('Export Lost Params: [appId]')
      if (!response.callbackId)
        throw new Error('Export Lost Params: [callbackId]')

      const doc = await Service.findOne({appId: response.appId})
      var targetSocket = io.sockets.connected[doc.socketId]
      if (targetSocket)
        targetSocket.emit('YOUR_REQUEST_HAS_RESPONSE', response)
    } catch(e){
      console.error(e)
    }
  }

  /**
   * register service
   * @param socket
   * @param data
   * @returns {Emitter|Namespace|Socket|*}
   */
  handleRegister = async (socket, data)=>{
    const {Service} = this.state
    try {
      console.log('register')
      console.log(data)
      console.log(socket.id)
      if (!socket.id) throw new Error('LOST_SOCKET_ID')

      const insertData = {
        online: 1,
        appId: data.appId,
        socketId: socket.id,
        appSecret: data.appSecret
      }

      const doc = await Service.findOne({
        appId: insertData.appId,
        appSecret: insertData.appSecret
      })

      if (!doc) throw new Error("PERMISSION_DENIED")
      await Service.update({appId: insertData.appId}, {$set: insertData}, {})
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {success: 1})
    } catch(e){
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {error: e})
    }
  }




  /****************
   *
   * INIT Service
   *
   **************/
  start = async (opts={})=>{
    if (this.state.isStarted) return false
    const Hub = this
    const {addNewServiceByFilePath,
      updateServiceByFilePath,
      removeServiceByFilePath} = this

    opts.port = opts.port || 3311

    try {
      /**
       * Create an `nedb` instance
       * @type {datastore}
       */
      const Service = new Datastore({
        filename: 'data/db/Service.db',
        autoload: true
      })

      /**
       * Create a socket instance
       */
      const io = SocketIO()

      Hub.setState({
        Service: Service,
        io: io,
        opts: opts
      })

      /**
       * this dir is placed to store service configure files
       * this dir will not automatic update
       */
      mkdirp.sync('data/service')

      /**
       * empty old registerd services
       */
      await Hub.empty()


      const files = await glob('data/service/**/*.json', {})
      if (!files.length) console.warn('none service defination file found')

      /**
       * register services and listen changes.
       */
      files.forEach(item=> {addNewServiceByFilePath(item)})
      watch.createMonitor('data/service', (monitor)=> {
        monitor.on("created", addNewServiceByFilePath)
        monitor.on("changed", updateServiceByFilePath)
        monitor.on("removed", removeServiceByFilePath)
      })

      /*****************
       *
       * socket.io server monitor
       *
       ****************/

      /**
       * handle connection
       */
      io.on('connection',(socket)=>{
        console.log('new connection '+socket.id)
        socket.on('REGISTER', (data) => {
          Hub.handleRegister(socket, data)
        })
        socket.on('I_HAVE_A_REQUEST', (request) => {
          Hub.handleRequest(socket, request)
        })
        socket.on('I_HAVE_HANDLE_THIS_REQUEST', (response) => {
          Hub.handleResponse(socket, response)
        })

        /**
         * handle disconnect
         */
        socket.on('disconnect', async () => {
          console.log(socket.id+' disconnected')
          await Service.update({socketId: socket.id}, {$set: {
            socketId: null,
            online: 0
          }}, {})
        })
      })

      /**
       * listing on a port
       */
      console.log(`listening on port ${opts.port}`)
      io.listen(opts.port)

    } catch(e){
      // throw new Error('File RW+ Permission Denied.')
      throw e
    }
  }
}

export default Hub