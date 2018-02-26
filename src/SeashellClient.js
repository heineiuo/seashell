import WebSocket from 'isomorphic-ws'
import { BSON, ObjectId, Binary } from 'bson'
import Joi from 'joi'
import { promisify } from 'util'
import EventEmitter from 'events'
import errors from './errors'

export const bson = new BSON()
export const validate = promisify(Joi.validate)
export const noop = () => { }

export const messageSchema = Joi.object().keys({
  headers: Joi.object().keys({
    'x-seashell-guard': Joi.string().required(),
    'x-seashell-connection-id': Joi.string().required(),
    'x-seashell-source-socket-id': Joi.string(),
    'x-seashell-method': Joi.string(),
    'x-seashell-url': Joi.string(),
    'x-seashell-hostname': Joi.string(),
    'x-seashell-socket-id': Joi.string(),
  }).required(),
  body: Joi.any()
})

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
      }, this._options.pingLoopTime || 60000)
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
      const { headers } = await validate(json, messageSchema, { allowUnknown: true })

      const guard = headers['x-seashell-guard']
      const connectionId = headers['x-seashell-connection-id']
      const sourceSocketId = headers['x-seashell-source-socket-id']

      const isRequest = guard === 'request-chunk' || guard === 'request'
      const isConnectionIdExist = this.emitters.hasOwnProperty(connectionId)
      const body = json.body instanceof Binary ? json.body.buffer : json.body

      if (isRequest) {
        if (!isConnectionIdExist) {
          // 初次创建请求
          const req = this.emitters[connectionId] = new EventEmitter()
          req.body = body
          req.method = headers['x-seashell-method']
          req.url = headers['x-seashell-url']
          // TODO 是否需要清除x-shell-* header?
          req.headers = headers
          const _write = (chunk = null, options = {}) => {
            const json = {
              headers: {
                'x-seashell-source-socket-id': sourceSocketId,
                'x-seashell-connection-id': connectionId,
                'x-seashell-guard': options['x-seashell-guard'] || 'response-chunk'
              },
              body: chunk
            }
            if (!res.headerSent) {
              res.headerSent = true
              json.headers = Object.assign({}, options.headers, json.headers)
            }
            const chunkMessage = chunk instanceof Buffer ?
              bson.serialize(json) :
              JSON.stringify(json)
            this.ws.send(chunkMessage)
          }

          const res = {
            req,
            request: req,
            headerSent: false,
            write: (chunk, options) => {
              _write(chunk, options)
            },
            end: (chunk) => {
              _write(chunk, {
                'x-seashell-guard': 'response'
              })
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
          this.emitters[connectionId].removeAllListeners()
          delete this.emitters[connectionId]
        }

      } else {
        // is response

        if (!isConnectionIdExist) {
          // 接收到响应但是请求id不存在，说明创建的请求已经清除（比如进程重启），则丢弃响应
          console.log(`[${new Date}] ws drop response message, connectionId: ${connectionId}`)
        } else {
          if (!this.emitters[connectionId].headers) {
            this.emitters[connectionId].headers = headers
            this.emitters[connectionId].emit('headers', headers)
          }
          if (!!body) {
            this.emitters[connectionId].emit('data', body)
          }
          if (guard === 'response') {
            this.emitters[connectionId].emit('end')
          }
        }

      }
    } catch (e) {
      // console.log(e)
      console.log(`[${new Date}] ws drop an unknown message`)
    }
  }

  /**
   * 创建请求
   * @param {*} originUrl 
   * @param {*} requestOptions 
   */
  request = (originUrl, requestOptions = {}, callback) => {
    const connectionId = ObjectId().toString()
    while (originUrl[0] === '/') {
      originUrl = originUrl.substr(1)
    }
    const firstSlash = originUrl.indexOf('/')
    const url = firstSlash === -1 ? '/' : originUrl.substr(firstSlash)
    const hostname = firstSlash === -1 ? originUrl : originUrl.substring(0, firstSlash)
    const headers = Object.assign({}, requestOptions.headers, {
      'x-seashell-hostname': hostname,
      'x-seashell-connection-id': connectionId,
      'x-seashell-url': url,
      'x-seashell-guard': 'request-chunk'
    })

    const _write = (chunk, extHeaders = {}) => {
      const json = {
        headers: Object.assign({}, headers, extHeaders),
        body: chunk
      }
      this._send(json)
    }

    const response = this.emitters[connectionId] = new EventEmitter()

    response.on('headers', () => {
      callback(response)
    })

    const req = {
      write: (chunk) => {
        _write(chunk)
      },
      end: (chunk) => {
        _write(chunk, {
          'x-seashell-guard': 'request'
        })
      },
      destroy: () => {
        response.removeAllListeners()
        delete this.emitters[connectionId]
      },
    }

    if (!!requestOptions.body) {
      req.end(requestOptions.body)
    }
    return req
  }
}

export default SeashellClient
