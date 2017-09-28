/**
 * 1. 或许Seashell可以继承App, App1通过Seashell请求App2时，Seashell会作为中转用途的App去请求App2,
 * 相当于Seashell这个App提供了两个接口，1是接收请求并转发请求，2是接收返回并转发返回
 * 注意，Seashell在请求App2时，考虑到Seashell知道App2正在「连着自己」，所以Seashell直接给App2发请求
 * 当Seashell发现App2不连着自己时，Seashell可以查看自己连接着的其他Seashell2，并将发送请求给Seashell2
 *
 * 2. Seashell维护作为App的状态，也维护作为Seashell，对App进行管理的状态。
 *
 * 3. 可以理解为App之间是父子关系，作为父即Seashell，可以接受子请求，转发给子，
 * 作为子即App，处理请求，返回数据
 *
 */

import WebSocket from 'isomorphic-ws'
import Url from 'url'
import uuid from 'uuid'
import Emitter from 'events'
import { parseBuffer, clearUnsafeHeaders, splitUrl } from './util'
import Seashell from './Seashell'

class SeashellServer extends Seashell {

  constructor(opts) {
    super()
    this.__options = Object.assign({}, opts)
  }

  attach = (server) => {
    if (this.__start) return new Error('Seashell has started')
    delete this.__options.port
    this.__options.server = server
    this.server = new WebSocket.Server(this.__options)
    this.server.on('connection', this.onChildConnection)
    this.__start = true
  }

  listen = (port) => {
    if (this.__start) return new Error('Seashell has started')
    this.server = new WebSocket.Server(this.__options)
    this.server.on('connection', this.onChildConnection)
    this.__start = true
  }

  __SEASHELL_NAME = 'seashell'
  __SEASHELL_SOCKET_QUERY_URL = '/socket/query'
  __SEASHELL_SOCKET_BIND_URL = '/socket/bind'
  __SEASHELL_SOCKET_SESSION_URL = '/socket/session'
  __SEASHELL_SOCKET_UNBIND_URL = '/socket/unbind'

  __connections = {}


  /**
   * handle socket connection
   */
  onChildConnection = async (socket) => {

    const url = Url.parse(socket.upgradeReq.url, { parseQueryString: true })
    this.emit('log', 'INFO', `[new connection: ${url.query.appName}, ${url.query.appId}]`)
    socket.id = uuid.v1()
    this.__connections[socket.id] = socket

    try {
      if (!socket.id) throw new Error('LOST_SOCKET_ID')
      const socketDataAll = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SOCKET_BIND_URL,
          originUrlDescription: '__SEASHELL_SOCKET_BIND_URL',
        },
        body: {
          socketId: socket.id,
          registerInfo: url.query
        }
      })
      if (socketDataAll.body.error) throw new Error(socketDataAll.body.error)
      socket.send(clearUnsafeHeaders({
        headers: { type: 'YOUR_REGISTER_HAS_RESPONSE' },
        body: { success: 1, socketData: socketDataAll.body }
      }))

      const socketData = socketDataAll.body

      this.emit('log', 'INFO', `${url.query.appName} register success, id: ${url.query.appId}`)
    } catch (e) {

      try {
        socket.send(clearUnsafeHeaders({
          headers: { type: 'YOUR_REGISTER_HAS_RESPONSE' },
          body: { error: e.message }
        }))
      } catch (e) {
        console.log('send fail' + e)
      }

      this.emit('log', 'ERROR', `${url.query.appName} register failed: ${e.message}`)
      return socket.close()
    }

    socket.on('message', (buf) => {
      const data = parseBuffer(buf)
      if (data.headers.type === 'I_HAVE_A_REQUEST') {
        process.nextTick(() => this.onChildRequest(socket, data))
      } else if (data.headers.type === 'I_HAVE_HANDLE_THIS_REQUEST') {
        process.nextTick(() => this.onChildResponse(socket, data))
      }
    })

    /**
     * handle disconnect
     */
    socket.on('close', () => {
      delete this.__connections[socket.id]
      this.onChildDisconnect(socket)
    })
  }


  onChildRequest = async (socket, req) => {

    const { importAppName, originUrl, __SEASHELL_START, appName, appId } = req.headers
    req.headers.__SEASHELL_START = Date.now()
    const isToSelf = importAppName === this.__SEASHELL_NAME


    try {
      req.headers.session = await this.requestSession(req, socket)

      /**
       * 发送请求
       * 如果请求的是集成服务, 则直接调用
       * 否则，先验证目标app是否在线, 在线则发包给目标app
       */
      if (isToSelf) {
        const result = await this.requestSelf(req)
        result.headers.type = 'YOUR_REQUEST_HAS_RESPONSE'
        socket.send(clearUnsafeHeaders(result))
      } else {
        const findResponseService = await this.requestSelf({
          headers: {
            originUrl: this.__SEASHELL_SOCKET_QUERY_URL,
            originUrlDescription: '__SEASHELL_SOCKET_QUERY_URL'
          },
          body: {
            appName: importAppName,
            appId
          }
        })
        const targetSocket = this.__connections[findResponseService.body.socketId]
        if (!targetSocket) throw new Error(findResponseService.body.error || 'TARGET_SERVICE_OFFLINE')

        req.headers.type = 'PLEASE_HANDLE_THIS_REQUEST'
        targetSocket.send(clearUnsafeHeaders(req))
      }

    } catch (err) {
      req.headers.status = 'ERROR'
      req.body.error = err.message
      req.headers.type = 'YOUR_REQUEST_HAS_RESPONSE'
      socket.send(clearUnsafeHeaders(req))

      this.emit('log', 'ERROR',
        `[${appName}] --> [${importAppName}${originUrl}]` +
        `[ERROR][${err.message}][${Date.now() - __SEASHELL_START}ms]`
      )
    }
  }




  onChildResponse = async (socket, res) => {

    const { appName, appId, callbackId, callbackAppId, importAppName, originUrl, __SEASHELL_START } = res.headers

    /**
     * 如果没有callbackId, drop这个处理（用于send请求，仅发送消息）
     * 如果请求来自requestChild, 触发callback emit
     * 否则如果没有appId或appName, 该响应非法
     * 否则根据appName和appId找到socket，
     * 存在不在线的情况，需要做丢弃或者离线处理（离线处理涉及到callbackId的存储问题）
     */
    if (!callbackId) return null

    try {
      if (res.headers.appName === this.__SEASHELL_NAME) {
        try {
          this.importEmitterStack[callbackId].emit('RESPONSE', res)
        } catch (e) { }
        return null
      }

      if (!appId || !appName) return null

      const findRequestApp = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SOCKET_QUERY_URL,
          originUrlDescription: '__SEASHELL_SOCKET_QUERY_URL'
        }, body: {
          appId: callbackAppId ? callbackAppId : appId,
          appName
        }
      })
      const requestSocket = this.__connections[findRequestApp.body.socketId] || null

      if (!requestSocket) {
        // todo add to task, when socket connected again, send res again.
        return this.emit('log', 'WARN', `the request app offline, maybe resent response later...`)
      }

      res.headers.type = 'YOUR_REQUEST_HAS_RESPONSE'
      requestSocket.send(clearUnsafeHeaders(res))
      this.emit('log', 'INFO',
        `[${requestSocket.appName}] --> [${importAppName}${originUrl}]` +
        `[DONE][${Date.now() - __SEASHELL_START}ms]`
      )

    } catch (e) {
      this.emit('log', 'ERROR', e)
    }
  }


  onChildDisconnect = (socket) => {
    const deleteSocket = (socketId, retry = 0) => {
      try {
        this.emit('log', 'INFO', `${socketId} disconnected`)
        this.requestSelf({
          headers: {
            originUrl: this.__SEASHELL_SOCKET_UNBIND_URL,
            originUrlDescription: '__SEASHELL_SOCKET_UNBIND_URL'
          },
          body: { socketId }
        })
      } catch (e) {
        if (retry < 3) {
          retry++
          deleteSocket(socketId, retry)
        }
      }
    }
    deleteSocket(socket.id)
  }


  /**
   * 获取client的session
   */
  requestSession = (req, socket = {}) => {
    return new Promise(async resolve => {
      try {
        const requestSession = await this.requestSelf({
          headers: {
            originUrl: this.__SEASHELL_SOCKET_SESSION_URL,
            originUrlDescription: '__SEASHELL_SOCKET_SESSION_URL'
          },
          body: {
            headers: req.headers,
            socketId: socket.id
          },
        })
        if (requestSession.body.error) return resolve(null)
        resolve(requestSession.body)
      } catch (e) {
        resolve(null)
      }
    })
  }


  /**
   * request client's who connect to tihs seashell instance.
   */
  requestChild = async (url, data = {}, options = { needCallback: true }) => {

    const { importAppName, originUrl } = splitUrl(url)
    const needCallback = options.needCallback || true

    const req = {
      body: data,
      headers: Object.assign({
        ...options.headers,
        appName: this.__SEASHELL_NAME,
        appId: 'SEASHELL',
        __SEASHELL_START: Date.now()
      }, {
          importAppName, originUrl
        })
    }


    return new Promise(async (resolve, reject) => {
      try {

        req.headers.session = await this.requestSession(req)


        /**
         * 发送请求
         * 如果请求的是集成服务, 则直接调用
         * 否则，先验证目标app是否在线, 在线则发包给目标app
         */
        if (importAppName === this.__SEASHELL_NAME) {
          const res = await this.requestSelf(req)
          return resolve(res)
        }
        const findResponseService = await this.requestSelf({
          headers: {
            session: req.headers.session,
            originUrl: this.__SEASHELL_SOCKET_QUERY_URL
          },
          body: {
            appName: importAppName
          }
        })
        const targetSocket = this.__connections[findResponseService.body.socketId]
        if (!targetSocket) throw new Error(findResponseService.body.error || 'TARGET_SERVICE_OFFLINE')

        if (needCallback) {
          const callbackId = req.headers.callbackId = uuid.v4()
          const callback = (res) => {
            delete this.importEmitterStack[callbackId]
            resolve(res)
            this.emit('log', 'INFO',
              `[${this.__SEASHELL_NAME}] --> [${importAppName}${originUrl}]` +
              `[DONE][${Date.now() - req.headers.__SEASHELL_START}ms]`
            )
            return null
          }
          this.importEmitterStack[callbackId] = new Emitter()
          this.importEmitterStack[callbackId].on('RESPONSE', callback)
          setTimeout(() => {
            try {
              this.importEmitterStack[callbackId].off('RESPONSE', callback)
              delete this.importEmitterStack[callbackId]
            } catch (e) { }
            return null
          }, this.__SEASHELL_REQUEST_TIMEOUT)

        } else {
          resolve()
        }

        req.headers.type = 'PLEASE_HANDLE_THIS_REQUEST'
        targetSocket.send(clearUnsafeHeaders(req))

      } catch (err) {
        req.headers.status = 'ERROR'
        req.body.error = err.message

        this.emit('log', 'ERROR',
          `[${this.__SEASHELL_NAME}] --> [${importAppName}${originUrl}]` +
          `[ERROR][${err.message}][${Date.now() - req.headers.__SEASHELL_START}ms]`
        )

        resolve(req)
      }
    })

  }

}

export default Seashell
