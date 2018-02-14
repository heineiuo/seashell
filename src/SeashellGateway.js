import WebSocket from 'isomorphic-ws'
import { BSON, ObjectId, Binary } from 'bson'
import Joi from 'joi'
import { promisify } from 'util'
import EventEmitter from 'events'
import Url from 'url'
import errors from './errors'
import SeashellClient, { validate, bson, noop } from './SeashellClient'

const defaultConnectionHandler = (socket, req) => {
  const id = ObjectId().toString()
  const url = Url.parse(socket.upgradeReq.url, { parseQueryString: true })
  // todo: verify connection
  console.log(`[${new Date}] new connection: ${socket.id}`)
  return {
    id
  }
}

class SeashellGateway extends SeashellClient {
  clientMap = {}

  createGatewayServer = (internalRequestHandler, connectionHandler = defaultConnectionHandler, options) => {
    const server = new WebSocket.Server({ server: options.server })
    server.on('connection', async (socket, req) => {
      try {
        const { id } = await connectionHandler(socket, req)
        socket.id = id
        this.clientMap[id] = socket
        socket.on('message', (msg) => this.handleGatewayMessage(msg, socket))
        socket.on('close', () => {
          delete this.clientMap[id]
        })
      } catch(e){
        console.log(e)
        socket.terminate()
      }
    })
    this.replaceInternalSocket(internalRequestHandler)
    return server
  }

  handleGatewayMessage = async (raw, socket) => {
    const rawType = typeof raw
    let json = null
    let error = null
    if (rawType === 'string') {
      try {
        json = JSON.parse(raw)
      } catch (e) {
        error = e
      }
    } else if (rawType === 'object' && raw instanceof Buffer) {
      json = bson.deserialize(raw)
    } else if (rawType === 'object') {
      // from internal 
      json = raw
    } else {
      error = new Error('Unsupport message type')
    }

    if (error) {
      return console.log(`[${new Date()}] drop a message`)
    }

    try {
      const { headers, body } = await validate(json, Joi.object().keys({
        headers: Joi.object().keys({
          guard: Joi.string().required(),
          url: Joi.string(),
          hostname: Joi.string(),
          sourceSocketId: Joi.string(),
          connectionId: Joi.string().required(),
          httpMethod: Joi.string(),
          httpHeaders: Joi.object(),
        }),
        body: Joi.any()
      }), { allowUnknown: false })
      const { connectionId, guard, finish, url, sourceSocketId, hostname } = headers
      const isConnectionIdExist = this.emitters.hasOwnProperty(connectionId)
      const isRequest = guard === 'request' || guard === 'request-chunk'

      if (isRequest) {
        if (!isConnectionIdExist) {
          return console.log(`[${new Date()}] drop a request message lost connectionId`)
        }
        // hostname就是连接gateway时使用的id
        const target = this.clientMap[hostname] 
        if (!target) {
          return console.log(`[${new Date()}] drop a message`)
        }

        // 如果是发起请求，则sourceSoceketId 必须是 socket.id
        json.headers.sourceSocketId = socket.id

        target.send(
          json.body instanceof Buffer ? bson.serialize(json) : JSON.stringify(json)
        )
      } else {
        /**
         * 这里处理的是client对server发送的请求的响应，
         * 主要是web需要请求client的资源的时候，server作为
         * 中间代理，将client的资源反馈给web
         */
        if (!sourceSocketId) {
          console.log(`[${new Date()}] ws drop a response message because lost sourceSocketId`)
          return false
        }
        const sourceSocket = this.clientMap[sourceSocketId]

        if (!sourceSocket) {
          console.log(`[${new Date()}] ws drop a response message because sourceSocket offline`)
          return false
        }

        if (sourceSocket._internal) {
          const data = body instanceof Binary ? body.buffer : body
          if (!!data) this.emitters[connectionId].emit('data', data)
          if (guard === 'response') {
            this.emitters[connectionId].emit('end')
          }
          return false
        }

        sourceSocket.send(
          json.body instanceof Buffer ? bson.serialize(json) : JSON.stringify(json)
        )
      }

    } catch (e) {
      console.log(`[${new Date()}] drop a message`)
      console.log(e)
    }
  }


  /**
   * 构建一个内部虚拟socket，用来请求自己:P
   */
  replaceInternalSocket = (requestHandler) => {
    const id = ObjectId().toString()
    this.ws = this.clientMap[id] = {
      id,
      _internal: true,
      hostname: 'seashell',
      send: (raw) => {
        const req = {}
        const res = {}
        requestHandler(req, res)
      }
    }
    this._send = (json) => {
      this.handleGatewayMessage(json, this.ws)
    }
  }
}

export default SeashellGateway


