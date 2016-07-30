import SocketIO from 'socket.io'
import Base from './Base'
import admin from '../admin'
import config from '../utils/config'
import * as Service from '../db/db'

class Hub extends Base {
  state = {}

  /**
   * receive request from a service
   * 1. get request data
   * 2. validate service permission
   * 3. pipe request to target service
   */
  handleRequest = async (socket, req) => {
    const { io } = this.state

    try {
      if (!req.headers.callbackId) throw new Error('LOST_CALLBACK_ID')
      req.headers.__SEASHELL_START = Date.now()

      const importAppName = req.headers.importAppName
      /**
       * 验证请求是否合法
       */
      const reqService = await Service.getAppBySocketId(socket.id)
      /**
       * 验证目标app是否在线
       */
      const resServiceId = await Service.getResSocketIdWithBalance(importAppName)

      console.log(`[seashell] ${reqService.appName} --> ${req.headers.importAppName}${req.headers.originUrl}`)

      /**
       * 如果请求的是admin, 则直接调用admin接口
       */
      if (importAppName == 'admin') return this.handleAdminRequest(socket, req)
      /**
       * 发包给目标app
       */
      console.log(`发包给目标app: ${resServiceId}`)
      io.sockets.connected[resServiceId].emit('PLEASE_HANDLE_THIS_REQUEST', req)

    } catch(e) {
      console.log(e)
      const res = {
        headers: {
          callbackId: req.headers.callbackId
        },
        body: {
          error: typeof e == 'string'?e:'HUB_EXCEPTION_ERROR'
        }
      }
      socket.emit('YOUR_REQUEST_HAS_RESPONSE', res)
      console.log(
        `[seashell] request failed because ${e}`
      )
    }
  }

  /**
   * 处理admin操作的请求
   * @param reqSocket
   * @param req
   */
  handleAdminRequest = async (reqSocket, req) => {
    const { handleLoop } = admin
    console.log(`[seashell] handle admin request: ${JSON.stringify(req)}`)
    const res = {
      headers: {
        appId: req.headers.appId,
        callbackId: req.headers.callbackId
      },
      body: {},
      end: () => {
        reqSocket.emit('YOUR_REQUEST_HAS_RESPONSE', {
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
   * handle `callback`
   * @return response.appId `response header's service id`
   * @return response.callbackId `callbackId`
   * @return response.data `response body`
   */
  handleResponse = async (socket, res) => {
    const {io} = this.state

    try {
      if (!res.headers.appId) throw new Error('Export Lost Params: [appId]')
      if (!res.headers.callbackId) throw new Error('Export Lost Params: [callbackId]')

      /**
       * 根据appId找到socket
       * 如果目标在线, 发送消息
       */
      const reqSocket = await Service.getSocketByAppId(res.headers.appId)
      console.log(reqSocket)
      io.sockets.connected[reqSocket.socketId].emit('YOUR_REQUEST_HAS_RESPONSE', res)
      console.log(
        `[seashell] ${reqSocket.appName} <-- ${res.headers.originUrl},` +
        ` total spend ${Date.now() - res.headers.__SEASHELL_START}ms`
      )

    } catch(e) {
      if (e == 'REQUEST_SOCKET_OFFLINE') {
        // todo add to task, when socket connected again, send res again.
        return console.log(`[seashell] reqSocket offline`)
      }
      console.log(e.stack||e)
    }
  }

  /**
   * register service
   * @param socket
   * @param data
   * @returns {Emitter|Namespace|Socket|*}
   */
  handleRegister = async (socket, data) => {
    try {
      if (!socket.id) throw 'LOST_SOCKET_ID'

      const insertData = {
        appName: data.appName,
        appId: data.appId,
        appSecret: data.appSecret
      }

      const socketData = await Service.bindAppToSocket(socket.id, insertData)
      console.log(`[seashell] register success, data: ${JSON.stringify(data)}`)
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {success: 1, socketData: socketData})
    } catch(e){
      console.log(`[seashell] register failed, data: ${data}`)
      const error = typeof e == 'string'? e : 'EXCEPTION_ERROR'
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {error})
    }
  }

  /****************
   *
   * INIT Service
   *
   **************/
  start = async () => {
    if (this.state.isStarted) return false
    const Hub = this

    try {

      /**
       * Create a socket instance
       */
      const io = SocketIO()
      Hub.setState({io})

      /**
       * empty old registered services
       */
      await Service.emptySocket()

      /**
       * import preset services
       */
      await Promise.all(config.presets.map(Service.importServiceFromConfig))
      /**
       * handle socket connection
       */
      io.on('connection',(socket) => {
        console.log(`[seashell] new connection ${socket.id}`)
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
        socket.on('disconnect', () => {
          const deleteSocket = async (socketId, retry=0) => {
            try {
              console.log(`[seashell] ${socketId} disconnected`)
              await Service.deleteSocket(socketId)
            } catch(e){
              if (retry < 3) {
                retry ++
                deleteSocket(retry)
              }
            }
          }
          deleteSocket(socket.id)
        })
      })

      /**
       * listing on a port
       */
      console.log(`listening on port ${config.port}`)
      io.listen(config.port)

    } catch(e) {
      console.log(e.stack||e)
      throw e
    }
  }
}

export default Hub