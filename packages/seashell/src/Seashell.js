import WebSocket from 'ws'
import Emitter from 'events'
import uuid from 'uuid'
import { Context } from './Context'
import { clearUnsafeHeaders, parseBuffer, splitUrl } from './util'
import Router from './Router'


/**
 * App
 * 继承自Router
 * 具有
 *  * 连接seashell，断开自动重新连接，
 *  * 接受请求并响应，
 *  * 处理自己对自己的请求等功能
 * 等功能
 */
class Seashell extends Emitter {

  constructor(requestListener) {
    super()
    this.requestListener = requestListener
  }

  appState = 0;
  importEmitterStack = {};

  __SEASHELL_RECONNECT_TIMEOUT = 1000;
  __SEASHELL_REQUEST_TIMEOUT = 300000;

  /**
   * receive & handle message from hub
   * @param {object} Request
   */
  onRequest = async (req) => {
    try {
      console.info(`[Seashell] handle request: ${req.headers.originUrl}`);
      const ctx = new Context(this.socket, req);
      this.requestListener(ctx)
      // this.handleLoop(ctx);
    } catch (e) {
      console.info(`[Seashell] ${e.message}`)
    }
  };

  /**
   * 当发送的请求收到响应结果时，处理响应结果
   * @param {object} Response
   */
  onResponse = (res) => {
    const { callbackId } = res.headers;
    this.importEmitterStack[callbackId].emit('RESPONSE', res);
  };

  /**
   * 向自己发送请求
   * 这可能听起来比较奇怪，但是既然自己能够向外开放接口，
   * 那为什么不能直接请求自己的这些接口呢
   * 
   * 其实相当于构造一个ctx，再直接调用router.handleLoop
   */
  requestSelf = (req) => {
    let state = 0; // 0 initial 1 success 2 error

    return new Promise(async (resolve, reject) => {
      try {
        const ctx = new Context({
          send: (res) => {
            const data = parseBuffer(res)
            if (data.headers.type === 'I_HAVE_HANDLE_THIS_REQUEST') {
              state = 1;
              resolve(data)
            } else {
              state = 2;
              reject(new Error('Unknown type of response header.'))
            }
          }
        }, req);

        ctx.on('end', () => {
          process.nextTick(() => {
            if (!ctx.state.isHandled) {
              console.log(`[Seashell] A no response request happened, please check ${req.headers.originUrl}.`);
              ctx.response.body = { error: 'NOT_FOUND' };
              ctx.response.end();
              resolve(ctx.response)
            }
          })
        });

        this.handleLoop(ctx);
      } catch (e) {
        reject(e)
      }
    });
  };

  /**
   * 1. 或许创建请求的方式有问题？
   * 请求本身应该是一个event emitter,
   * 请求通过socket发送数据，也从socket接收到的数据中过滤自己要的数据
   * （同时，响应也是从socket中读数据并进行处理）
   * 创建请求时，会有一个callbackId, 通过发送带有相同callbackId的数据实现
   * 流式发送，也实现流式读取。
   *
   * 2. 请求的生命周期从创建开始，中间经历发送数据和接收数据的过程，
   * 接收数据时emit data事件，提供给需要的函数
   *
   * 3. 突然想到其实request和response的数据结构应该是一样的。
   * response的context稍作修改就可以用于request。
   *
   * 4. 请求创建时会生成一个RequestContext, 一个Duplex Stream对象
   *
   *
   *  push a request to MQ hub.
   * @param url `/${appname}/${originUrl}`
   * @param data
   * @param options
   * @returns {Promise}
   *
   * use `socket.send` to push request
   * push a event callback to importEmitterStack every request
   * listening on `RESPONSE` event and return data
   */
  request = (url, data = {}, options = { needCallback: true }) => {
    if (typeof data !== 'object') throw `request data must be an object.`;
    const needCallback = options.needCallback || true;
    return new Promise((resolve, reject) => {
      try {
        if (this.appState !== 3) return reject("YOUR_SERVICE_IS_OFFLINE");
        /**
         * parse url, create req object
         */
        const req = {
          body: data,
          headers: Object.assign({
            ...options.headers,
            appName: this.appOptions.appName,
            appId: this.appOptions.appId,
          }, splitUrl(url))
        };

        if (needCallback) {
          const callbackId = uuid.v4();
          req.headers.callbackId = callbackId;
          this.importEmitterStack[callbackId] = new Emitter();
          this.importEmitterStack[callbackId].on('RESPONSE', (res) => {
            resolve(res);
            delete this.importEmitterStack[callbackId];
            return null
          });
        } else {
          resolve()
        }

        req.headers.type = 'I_HAVE_A_REQUEST'
        this.socket.send(clearUnsafeHeaders(req))
      } catch (e) {
        console.info(`[Seashell] REQUEST_ERROR ${e.message || e}`);
        reject(e)
      }
    })
  };


  bindEventHandlers = () => {
    this.socket.on('open', () => {
      console.info(`[Seashell] connected`);
      this.appState = 2;
    });

    this.socket.on('message', (e) => {
      const data = parseBuffer(e)
      if (data.headers.type === 'YOUR_REGISTER_HAS_RESPONSE') {
        console.info(`[Seashell] registered`);
        this.appState = 3;
      } else if (data.headers.type === 'YOUR_REQUEST_HAS_RESPONSE') {
        this.onResponse(data)
      } else if (data.headers.type === 'PLEASE_HANDLE_THIS_REQUEST') {
        this.onRequest(data)
      } else {
        console.log('Unknown message: ')
        console.log(data)
      }
    });

    this.socket.on('error', (err) => {
      console.error(err)
    })

    /**
     * listing disconnect event
     */
    this.socket.on('close', () => {
      console.info(`[Seashell] lost connection`);
      this.appState = 0;
      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.appOptions)
      }, __SEASHELL_RECONNECT_TIMEOUT)
    });
  };

  /**
   * connect to MQ hub.
   * @param opts
   * @returns {boolean}
   */
  connect = (opts = {}) => {
    if (this.appState > 0) return false;
    console.info(`[Seashell] connecting ${opts.url}`);
    this.socket = new WebSocket(opts.url)
    this.appState = 1;
    this.appOptions = opts;
    this.bindEventHandlers()
  };

  /**
   * disconnect with server
   * @returns {boolean}
   */
  disconnect = () => {
    if (this.appState > 0) {
      this.socket.close()
    }
    console.info(`[Seashell] disconnected`)
  }
}

export default Seashell
