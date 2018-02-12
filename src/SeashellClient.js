import WebSocket from 'isomorphic-ws'
import { BSON, ObjectId } from 'bson'
import Joi from 'joi'
import { promisify } from 'util'
import EventEmitter from 'events'
import errors from './errors'

export const bson = new BSON()
export const validate = promisify(Joi.validate)
export const noop = () => { }

class SeashellClient extends EventEmitter {

  emitters = {}
  ws = null
  createServer = (handleRequest, options) => {
    const connect = () => {
      if (this.ws) {
        this.ws.removeAllListeners()
        this.ws = null
      }
      try {
        this.ws = new WebSocket(options.serverAddress)

        this.ws.on('open', () => {
          console.log(`[${new Date()}] ws open`)
        })

        this.ws.on('message', (raw) => {
          const rawType = typeof raw
          if (rawType === 'string') {
            this.handleMessage(raw, handleRequest)
          } else if (rawType === 'object' && raw instanceof Buffer) {
            this.handleMessage(bson.deserialize(raw), handleRequest)
          } else {
            console.log(`[${new Date()}] ws unknown message type`)
          }
        })

        this.ws.on('error', () => {
          connect()
        })

        this.ws.on('close', () => {
          console.log(`[${new Date}] ws close`)
          connect()
        })
      } catch (e) {
        console.log(e)
        setTimeout(connect, 3000)
      }
    }

    connect()
  }

  _send = (json) => {
    if (!this.ws) throw new Error('Socket offline')
    const data = json.body instanceof Buffer ? bson.serialize(json) : JSON.stringify(json)
    this.ws.send(data)
  }

  /**
   * 处理请求
   * @param {*} raw 
   */
  handleMessage = async (raw, handleRequest) => {
    // console.log(raw)
    try {
      const { headers, body } = await validate(raw, Joi.object().keys({
        headers: Joi.object().keys({
          guard: Joi.string().required(),
          url: Joi.string(),
          hostname: Joi.string(),
          sourceSocketId: Joi.string(),
          socketId: Joi.string(),
          connectionId: Joi.string().required()
        }).required(),
        body: Joi.any()
      }), { allowUnknown: false })
      const { guard, connectionId, sourceSocketId } = headers
      const isRequest = guard === 'request-chunk' || guard === 'request'
      const isConnectionIdExist = this.emitters.hasOwnProperty(connectionId)

      if (!isRequest) {
        const { connectionId, guard } = headers
        if (!this.emitters.hasOwnProperty(connectionId)) {
          console.log(`[${new Date}] ws drop response message, connectionId: ${connectionId}`)
        } else {
          this.emitters[connectionId].emit('data', body)
          if (guard === 'response') {
            this.emitters[connectionId].emit('end')
          }
        }
      } else {
        if (!isConnectionIdExist) {
          const req = new EventEmitter()
          req.body = body
          req.headers = headers
          const _write = (chunk = null, options = {}) => {
            const json = {
              headers: {
                sourceSocketId,
                connectionId,
                guard: options.guard || 'response-chunk'
              },
              body: chunk
            }
            const chunkMessage = chunk instanceof Buffer ? bson.serialize(json) : JSON.stringify(json)
            this.ws.send(chunkMessage)
          }

          const res = {
            req,
            request: req,
            write: (chunk) => {
              _write(chunk)
            },
            end: (chunk) => {
              _write(chunk, { guard: 'response' })
            },
          }

          handleRequest(req, res)

        } else {
          this.emitters[connectionId].emit('data', body)
          if (guard === 'response') {
            this.emitters[connectionId].emit('end')
          }
        }
      }
    } catch (e) {
      console.log(e)
      console.log(`[${new Date}] ws drop an unknown message`)
    }
  }

  /**
   * 创建请求
   * @param {*} originUrl 
   * @param {*} requestOptions 
   */
  request = (originUrl, requestOptions = {}) => {
    const connectionId = ObjectId().toString()
    while (originUrl[0] === '/') {
      originUrl = originUrl.substr(1)
    }
    const firstSlash = originUrl.indexOf('/')
    const url = firstSlash === -1 ? '/' : originUrl.substr(firstSlash)
    const hostname = firstSlash === -1 ? originUrl : originUrl.substring(0, firstSlash)
    const headers = {
      hostname,
      connectionId,
      url,
      guard: 'request-chunk'
    }
    if (ObjectId.isValid(hostname)) headers.socketId = hostname

    const _write = (chunk, writeOptions = {}) => {
      const json = {
        headers: Object.assign({}, headers, { guard: writeOptions.guard }),
        body: chunk
      }
      const chunkMessage = chunk instanceof Buffer ? bson.serialize(json) : json
      this._send(chunkMessage)
    }

    const response = this.emitters[connectionId] = new EventEmitter()

    const req = {
      write: (chunk) => {
        _write(chunk)
      },
      end: (chunk) => {
        _write(chunk, { guard: 'request' })
      },
      destroy: () => {
        this.emitters[connectionId].removeAllListeners()
        delete this.emitters[connectionId]
      },
      res: response,
      response
    }

    if (!!requestOptions.body) {
      req.end(requestOptions.body)
    }
    return req
  }
}

export default SeashellClient
