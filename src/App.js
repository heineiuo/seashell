import uuid from 'uuid'
import SocketIOClient from 'socket.io-client'
import Base from './Base'
import Emitter from './Emitter'

class App extends Base {

  state = {
    isStarted: false,
    isOnline: false,
    isRegistered: false,
    importEmitterStack: {},
    exportActionStack: {}
  }

  /**
   * middleware
   * todo
   * @param pathname
   * @param middleware
   */
  use = (pathname, middleware) => {
    const {exportActionStack} = this.state
    exportActionStack[pathname] = (request) => {
      return new Promise(async (resolve, reject)=>{
        try {
          resolve(middleware(request))
        } catch(e){
          reject(e)
        }
      })
    }
  }

  /**
   * receive & handle message from hub
   * @param request
   */
  handleRequest = async (request) => {
    console.log('handle request: '+JSON.stringify(request))
    const {exportActionStack, socket} = this.state
    const response = {
      appId: request.appId,
      callbackId: request.callbackId
    }

    try {
      const data = await exportActionStack[request.actionName](request)
      response.data = data
    } catch(e){
      response.data = {error: e}
    }

    socket.emit('I_HAVE_HANDLE_THIS_REQUEST', response)
  }


  /**
   * push a request to MQ hub.
   * @param serviceName
   * @param data
   * @returns {Promise}
   *
   * use `socket.emit` to push request
   * push a event callback to importEmitterStack every request
   * listening on `RESPONSE` event and return data
   */
  request = (serviceName, data) => {
    const {socket, importEmitterStack} = this.state
    return new Promise( (resolve, reject)=>{
      try {
        if (!this.state.isOnline) return reject("YOUR_SERVICE_IS_OFFLINE")
        const callbackId = uuid.v4()
        importEmitterStack[callbackId] = new Emitter()
        data.importAppName = serviceName
        data.callbackId = callbackId
        console.log(`Start request servicehub, data: ${JSON.stringify(data)}`)
        importEmitterStack[callbackId].on('RESPONSE', (response) => {
          resolve(response)
          delete importEmitterStack[callbackId]
          return null
        })
        socket.emit('I_HAVE_A_REQUEST', data)
      } catch(e) {
        reject(e)
      }
    })
  }


  /**
   * connect to MQ hub.
   * @param opts
   * @returns {boolean}
   */
  connect = (opts={}) => {
    if (this.state.isStarted) return false
    console.log(opts)
    const app = this
    const {handleRequest} = this
    const socket = SocketIOClient(opts.url)
    this.setState({
      opts: opts,
      isStarted: true,
      socket: socket
    })

    socket.on('connect', () => {
      console.log('connected')
      console.log('start register')
      app.setState({isOnline: true})

      /**
       * IMPORTANT, every service should registered to work.
       */
      socket.emit('REGISTER', opts.key)
    })

    /**
     * handle hub's response about register
     * if there's some error, means register has failed
     * otherwise, it succeed
     */
    socket.on('YOUR_REGISTER_HAS_RESPONSE', (response) => {
      app.setState({
        isRegistered: true
      })
    })

    /**
     * handle response
     * response should have `callbackId` key.
     */
    socket.on('YOUR_REQUEST_HAS_RESPONSE', (response) => {
      const {importEmitterStack} = this.state
      importEmitterStack[response.callbackId].emit('RESPONSE', response)
      delete importEmitterStack[response.callbackId]
      app.setState({
        importEmitterStack: importEmitterStack
      })
    })

    /**
     * handle request
     */
    socket.on('PLEASE_HANDLE_THIS_REQUEST', handleRequest)

    /**
     * listing disconnect event
     */
    socket.on('disconnect', () => {
      console.log('disconnected')
      app.setState({isOnline: false})
    })
  }
}

export default App