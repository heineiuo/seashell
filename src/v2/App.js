import SocketIOClient from 'socket.io-client'
import defaultsDeep from 'lodash.defaultsdeep'
import defaults from 'lodash.defaults'

import Base from './Base'
const Emitter = require('../Emitter')
const md5 = require('../md5')

class App extends Base {

  state = {
    isStarted: false,
    isOnline: false,
    importEmitterStack: {},
    exportActionStack: {}
  }

  /**
   * 请求MQ
   * @param serviceName
   * @param data
   * @returns {Promise}
   *
   * 每次请求向本地事件流堆一个回调
   * 监听本地事件流`importResponse`消息, resolve响应数据包
   *
   * 触发import消息, 向MQ发送请求数据包
   */
  request = (serviceName, data)=>{
    const {socket, importEmitterStack} = this.state
    return new Promise( (resolve, reject)=>{
      try {
        if (!this.state.isOnline) return reject("YOUR_SERVICE_IS_OFFLINE")
        var callbackId = md5(String(Math.random()+Date.now()))
        importEmitterStack[callbackId] = new Emitter()
        data.importAppName = serviceName
        data.callbackId = callbackId
        console.log('start request servicehub, data: '+JSON.stringify(data))
        importEmitterStack[callbackId].on('importResponse', (response) =>{
          resolve(response)
          delete importEmitterStack[callbackId]
          return null
        })
        socket.emit('import', data)
      }catch(e){
        reject(e)
      }
    })
  }

  /**
   * 连接MQ
   * @param opts
   * @returns {boolean}
   */
  connect = (opts)=>{
    if (this.state.isStarted) return false
    console.log(opts)
    const socket = SocketIOClient(opts.url)
    this.setState({
      opts: opts,
      isStarted: true,
      socket: socket
    })

    /**
     * 连接并注册
     */
    socket.on('connect', ()=> {
      console.log('connected')
      console.log('start register')
      this.setState({isOnline: true})
      socket.emit('register', opts.key)
    })

    /**
     * onResponse
     * 收到MQ的请求回应
     * 回应包里带有callbackId
     */
    socket.on('export', (response) =>{
      const {importEmitterStack} = this.state
      importEmitterStack[response.callbackId].emit('importResponse', response)
      delete importEmitterStack[response.callbackId]
      this.setState({
        importEmitterStack: importEmitterStack
      })
    })

    /**
     * onRequest
     * 处理请求, 并向MQ发送结果
     */
    socket.on('import', (request) =>{
      this.handleRequest(request)
    })

    /**
     * 连接断开, 重连
     */
    socket.on('disconnect', () =>{
      console.log('disconnected')
      this.setState({isOnline: false})
    })
  }

  /**
   * 中间件
   * @param pathname
   * @param middleware
   */
  use = (pathname, middleware)=>{

  }

  /**
   * 处理MQ发过来的请求, 调用中间件
   * @param request
   */
  handleRequest = (request)=>{
    console.log('handle request: '+JSON.stringify(request))
    const {exportActionStack, socket} = this.state
    exportActionStack[request.actionName](request, (responseData) =>{
      socket.emit('export', {
        appId: request.appId,
        callbackId: request.callbackId,
        data: responseData
      })
    })
  }
}

export default App