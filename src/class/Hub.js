import SocketIO from 'socket.io'
import Base from './Base'
import admin from '../admin'
import config from '../utils/config'
import * as Service from '../db/service'
import * as Socket from '../db/socket'

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
      const reqService = await Service.getServiceBySocketId(socket.id)
      if (!reqService) throw 'PERMISSION_DENIED'
      /**
       * 验证目标app是否在线
       */
      const resService = await Service.getServiceWithBalance(importAppName)
      if (!resService) throw "TARGET_SERVICE_OFFLINE"

      console.log(`[seashell] ${reqService} --> ${req.headers.originUrl}`)

      /**
       * 如果请求的是admin, 则直接调用admin接口
       */
      if (importAppName == 'admin') return this.handleAdminRequest(socket, req)
      /**
       * 发包给目标app
       */
      io.sockets.connected[resService.socketId].emit('PLEASE_HANDLE_THIS_REQUEST', req)

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
        `[seashell] request failed because ${req.body.error}`
      )
    }
  }

  /**
   * 处理admin操作的请求
   * @param socket
   * @param req
   */
  handleAdminRequest = async (socket, req) => {
    const res = {
      headers: {
        callbackId: req.headers.callbackId
      },
      body: {}
    }
    socket.emit('YOUR_REQUEST_HAS_RESPONSE', res)
  }

  /**
   * handle `callback`
   * @return response.appId `response header's service id`
   * @return response.callbackId `callbackId`
   * @return response.data `response body`
   */
  handleResponse = async (socket, res) => {
    const {Service, io} = this.state

    try {
      if (!res.headers.appId) throw new Error('Export Lost Params: [appId]')
      if (!res.headers.callbackId) throw new Error('Export Lost Params: [callbackId]')

      /**
       * 根据appId找到socket
       * 如果目标在线, 发送消息
       */
      const reqService = await Service.findOne({appId: res.headers.appId})
      const reqSocket = io.sockets.connected[reqService.socketId]
      if (reqSocket) {
        reqSocket.emit('YOUR_REQUEST_HAS_RESPONSE', res)
        console.log(
          `[seashell] ${reqService} <-- ${res.headers.originUrl},` +
          ` total spend ${Date.now() - res.headers.__SEASHELL_START}ms`
        )
      } else {
        // todo add to task, when socket connected again, send res again.
        console.log(`[seashell] reqSocket offline`)
      }

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
  handleRegister = async (socket, data) => {
    const {Service} = this.state
    try {
      if (!socket.id) throw new Error('LOST_SOCKET_ID')

      const insertData = {
        online: 1,
        appId: data.appId,
        socketId: socket.id,
        appSecret: data.appSecret
      }

      const verifiedService = await Service.findOne({
        appId: insertData.appId,
        appSecret: insertData.appSecret
      })

      if (!verifiedService) throw new Error("PERMISSION_DENIED")
      await Service.update({appId: insertData.appId}, {$set: insertData}, {})

      console.log(`[seashell] register success, data: ${data}`)
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {success: 1})
    } catch(e){
      console.log(`[seashell] register failed, data: ${data}`)
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {error: e})
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

      Hub.setState({
        io: io
      })

      /**
       * empty old registered services
       */
      await Socket.emptySocket()

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
              await Socket.deleteSocket(socketId)
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

    } catch(e){
      console.log(e.stack||e)
      throw e
    }
  }
}

export default Hub