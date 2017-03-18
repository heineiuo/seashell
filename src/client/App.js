import uuid from 'uuid'
import SocketIOClient from 'socket.io-client'
import Router from './Router'
import Emitter from './Emitter'
import { SeashellChalk } from './chalk'

class App extends Router {

  state = {
    /**
     * 是否启动
     */
    isStarted: false,
    /**
     * 是否已经连接上hub
     */
    isOnline: false,
    /**
     * 是否已经注册, 只有注册后才能调用其他service
     */
    isRegistered: false,

    importEmitterStack: {}
  }

  /**
   * receive & handle message from hub
   * @param req
   */
  handleRequest = async (req) => {
    const {socket} = this.state
    const {handleLoop} = this
    console.log(`${SeashellChalk} handle request: ${req.headers.originUrl}`)
    Object.assign(req, {params: {}})
    const res = {
      headers: req.headers,
      body: {},
      end: () => {
        socket.emit('I_HAVE_HANDLE_THIS_REQUEST', {
          headers: res.headers,
          body: res.body
        })
      }
    }
    const next = (err, req, res, index, pathname) => {
      return handleLoop(err, req, res, next, index, pathname)
    }
    next(null, req, res, 0, req.headers.originUrl)
  }


  /**
   * push a request to MQ hub.
   * @param url `/${appname}/${originUrl}`
   * @param data
   * @returns {Promise}
   *
   * use `socket.emit` to push request
   * push a event callback to importEmitterStack every request
   * listening on `RESPONSE` event and return data
   */
  request = (url, data={}) => {
    if (typeof data != 'object') throw `${SeashellChalk} request data must be an object.`
    const {socket, importEmitterStack, appId} = this.state
    return new Promise( (resolve, reject)=>{
      try {
        if (!this.state.isOnline) return reject("YOUR_SERVICE_IS_OFFLINE")
        /**
         * parse url, create req object
         */
        const callbackId = uuid.v4()
        const req = {
          body: data,
          headers: {
            appId: appId,
            callbackId: callbackId
          }
        }
        const s = url.search('/')
        if ( s < 0 ) {
          req.headers.importAppName = url
          req.headers.originUrl = '/'
        } else {
          const sUrl = s==0?url.substr(1):url
          let ss = sUrl.search('/')
          req.headers.importAppName = ss > -1?sUrl.substring(0, ss):sUrl
          req.headers.originUrl = ss > -1? sUrl.substring(ss):'/'
        }

        console.log(`${SeashellChalk} Start request: ${url}`)

        /**
         * set callback
         * @type {Emitter}
         */
        importEmitterStack[callbackId] = new Emitter()
        importEmitterStack[callbackId].on('RESPONSE', (res) => {
          resolve(res)
          delete importEmitterStack[callbackId]
          return null
        })

        /**
         * send request
         */
        socket.emit('I_HAVE_A_REQUEST', req)
      } catch(e) {
        console.log(`${SeashellChalk} ${e.stack||e}`)
        reject(e)
      }
    })
  }

  /**
   * request stream
   */
  requestStream = () => {
    // todo
  }

  /**
   * connect to MQ hub.
   * @param opts
   * @returns {boolean}
   */
  connect = (opts={}) => {
    if (this.state.isStarted) return false
    console.log(`${SeashellChalk} connection options: ${JSON.stringify(opts)}`)
    const app = this
    const {handleRequest} = this
    const socket = SocketIOClient(opts.url)
    this.setState({
      opts: opts,
      appId: opts.key.appId,
      isStarted: true,
      socket: socket
    })

    socket.on('connect', () => {
      console.log(`${SeashellChalk} connected`)
      console.log(`${SeashellChalk} registered`)
      app.setState({isOnline: true})

      /**
       * IMPORTANT, every app should registered to work.
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
    socket.on('YOUR_REQUEST_HAS_RESPONSE', (res) => {
      const {importEmitterStack} = this.state
      const {callbackId} = res.headers
      importEmitterStack[callbackId].emit('RESPONSE', res)
      delete importEmitterStack[callbackId]
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
      console.log(`${SeashellChalk} lost connection`)
      app.setState({isOnline: false})
    })
  }

  /**
   * disconnect with server
   * @returns {boolean}
   */
  disconnect = () => {
    if (this.state.isStarted) {
      const {socket} = this.state
      socket.disconnect()
    }
    console.log(`${SeashellChalk} disconnected`)
  }
}

export default App
