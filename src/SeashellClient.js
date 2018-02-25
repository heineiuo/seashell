import WebSocket from 'isomorphic-ws'
import { BSON, ObjectId, Binary } from 'bson'
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
    this._handleRequest = handleRequest
    this._options = options
    this._connect()
  }

  _connect = () => {
    if (this._connecting) return false
    this._connecting = true
    if (this.ws) {
      this.ws.removeAllListeners()
      this.ws = null
    }
    this.ws = new WebSocket(this._options.serverAddress)

    this.ws.on('open', () => {
      this._connecting = false
      this._pingLoop = setInterval(() => {
        this.ws.send('ping')
      }, 60000)
      console.log(`[${new Date()}] ws open`)
    })

    this.ws.on('message', (raw) => {
      const rawType = typeof raw
      if (rawType === 'string') {
        this.handleMessage(raw, this._handleRequest)
      } else if (rawType === 'object' && raw instanceof Buffer) {
        this.handleMessage(bson.deserialize(raw), this._handleRequest)
      } else {
        console.log(`[${new Date()}] ws unknown message type`)
      }
    })

    this.ws.on('error', (e) => {
      console.log(e)
    })

    this.ws.on('close', () => {
      clearInterval(this._pingLoop)
      console.log(`[${new Date}] ws close`)
      this._connecting = false
      setTimeout(this._connect, 3000)
    })
  }

  _send = (json) => {
    if (!this.ws) throw new Error('Socket offline')
    const data = json.body instanceof Buffer ? bson.serialize(json) : JSON.stringify(json)
    this.ws.send(data)
  }

  /**
   * 处理请求
   * @param {*} json 
   */
  handleMessage = async (json, handleRequest) => {
    // console.log(json)
    try {
      const { headers } = await validate(json, Joi.object().keys({
        headers: Joi.object().keys({
          guard: Joi.string().required(),
          connectionId: Joi.string().required(),
          sourceSocketId: Joi.string(),
          url: Joi.string(),
          hostname: Joi.string(),
          socketId: Joi.string(),
          httpMethod: Joi.string(),
          httpHeaders: Joi.object(),
        }).required(),
        body: Joi.any()
      }), { allowUnknown: false })
      const { guard, connectionId, sourceSocketId } = headers
      const isRequest = guard === 'request-chunk' || guard === 'request'
      const isConnectionIdExist = this.emitters.hasOwnProperty(connectionId)
      const body = json.body instanceof Binary ? json.body.buffer : json.body

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
          const req = this.emitters[connectionId] = new EventEmitter()
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
            const chunkMessage = chunk instanceof Buffer ?
              bson.serialize(json) :
              JSON.stringify(json)
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

          req.res = res
          req.response = res
          handleRequest(req, res)
        }

        if (!!body) {
          this.emitters[connectionId].emit('data', body)
        }

        if (guard === 'request') {
          this.emitters[connectionId].emit('end')
          delete this.emitters[connectionId]
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
    const headers = Object.assign({}, requestOptions.headers, {
      hostname,
      connectionId,
      url,
      guard: 'request-chunk'
    })

    const _write = (chunk, extHeaders = {}) => {
      const json = {
        headers: Object.assign({}, headers, extHeaders),
        body: chunk
      }
      this._send(json)
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
