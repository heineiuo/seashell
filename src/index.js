import SocketIO from 'socket.io'
import Emitter from 'events'
import uuid from 'uuid'
import chalk from 'chalk'
import {combineReducers} from 'sprucejs'

const SeashellChalk = chalk.blue.bold('[Seashell]');

class Seashell {

  constructor (db, app) {

    this.db = db;

    this.handler = combineReducers([
      require('./App'),
      require('./Group'),
      require('./Socket')
    ])(db);

    const createQuery = (action) => (params) => this.handler({
      reducerName: 'socket',
      action,
      ...params
    });

    this.Socket = {
      detail: createQuery('detail'),
      remove: createQuery('remove'),
      findByAppId: createQuery('findByAppId'),
      balance: createQuery('balance'),
      bindApp: createQuery('bindApp')
    };

    /**
     * Create a socket instance
     */
    this.io = app?SocketIO(app):SocketIO();

    /**
     * handle socket connection
     */
    this.io.on('connection', (socket) => {
      console.log(`${SeashellChalk} new connection ${socket.id}`);
      socket.on('REGISTER', (data) => {
        this.register(socket, data)
      });
      socket.on('I_HAVE_A_REQUEST', (request) => {
        this.request(request, socket)
      });
      socket.on('I_HAVE_HANDLE_THIS_REQUEST', (response) => {
        this.response(socket, response)
      });

      /**
       * handle disconnect
       */
      socket.on('disconnect', () => {
        const deleteSocket = async(socketId, retry = 0) => {
          try {
            console.log(`${SeashellChalk} ${socketId} disconnected`);
            await this.Socket.remove({socketId})
          } catch (e) {
            if (retry < 3) {
              retry++;
              deleteSocket(socketId, retry)
            }
          }
        };
        deleteSocket(socket.id)
      })
    });

  }

  integrationEmitterStack = {};

  integrations = {};

  integrate = (integration) => {
    const {integrations, integrationEmitterStack} = this;
    const {name, router} = integration;
    integrations[name] = {
      router,
      request: (url, data) => {
        if (typeof data != 'object') throw `${SeashellChalk} request data must be an object.`;
        return new Promise(async (resolve, reject) => {
          try {
            /**
             * parse url, create req object
             */
            const callbackId = uuid.v1();
            const req = {
              body: data,
              headers: {
                appName: name,
                callbackId: callbackId
              }
            };
            const s = url.search('/');
            if (s < 0) {
              req.headers.importAppName = url;
              req.headers.originUrl = '/'
            } else {
              const sUrl = s == 0 ? url.substr(1) : url;
              let ss = sUrl.search('/');
              req.headers.importAppName = ss > -1 ? sUrl.substring(0, ss) : sUrl;
              req.headers.originUrl = ss > -1 ? sUrl.substring(ss) : '/'
            }


            /**
             * set callback
             * @type {Emitter}
             */
            integrationEmitterStack[callbackId] = new Emitter();
            integrationEmitterStack[callbackId].on('RESPONSE', (res) => {
              console.log(`${SeashellChalk} INTEGRATION_GOT_RES`);
              resolve(res);
              delete integrationEmitterStack[callbackId];
              return null
            });

            /**
             * send request
             */
            this.request(req, {integration: true});
            console.log(`${SeashellChalk} Integration ${name} Start request: ${url}`);
          } catch(e){
            console.log(e.stack);
            reject(e)
          }
        })
      }
    };

    router.request = integrations[name].request;
    this.integrations = integrations;
    return integrations[name]
  };


  /**
   * register app
   * @param socket
   * @param data
   * @returns {Emitter|Namespace|Socket|*}
   */
  register = async (socket, data) => {
    try {
      if (!socket.id) throw new Error('LOST_SOCKET_ID');
      const registerInfo = {
        appName: data.appName,
        appId: data.appId,
        appSecret: data.appSecret
      };

      const socketData = await this.Socket.bindApp({socketId: socket.id, registerInfo});
      console.log(`${SeashellChalk} register success, data: ${JSON.stringify(data)}`);
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {success: 1, socketData: socketData})
    } catch(e){
      console.log(`${SeashellChalk} register failed, data: ${data}`);
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {error: e.message})
    }
  };

  request = async (req, socket) => {

    try {
      if (!req.headers.callbackId) throw new Error('LOST_CALLBACK_ID');
      req.headers.__SEASHELL_START = Date.now();


      const {importAppName} = req.headers;
      const isIntegration = socket.hasOwnProperty('integration');
      const isRequestIntegration = this.integrations.hasOwnProperty(importAppName);

      /**
       * 验证请求是否合法
       * 如果请求来自集成服务, 跳过验证
       */
      if (!isIntegration) {
        const reqService = await this.Socket.detail({socketId: socket.id});
        console.log(`${SeashellChalk} ${reqService.appName} --> ${req.headers.importAppName}${req.headers.originUrl}`);
      } else {
        console.log(`${SeashellChalk} integration service --> ${req.headers.importAppName}${req.headers.originUrl}`);
      }

      /**
       * 发送请求
       * 如果请求的是集成服务, 则直接调用
       * 否则，先验证目标app是否在线, 在线则发包给目标app
       */
      if (isRequestIntegration) {
        const result = await this._requestIntegration(importAppName, socket, req);
        if (isIntegration) {
          this.integrationEmitterStack[req.headers.callbackId].emit('RESPONSE', result);
        } else {
          socket.emit('YOUR_REQUEST_HAS_RESPONSE', result);
        }
      } else {
        const resServiceId = await this.Socket.balance({importAppName});
        this.io.sockets.connected[resServiceId].emit('PLEASE_HANDLE_THIS_REQUEST', req)
      }
    } catch(e) {
      console.log(e.stack);
      const res = {
        headers: {
          callbackId: req.headers.callbackId
        },
        body: {
          error: e.message
        }
      };
      socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
      console.log(`${SeashellChalk} request failed because ${e.message}`);
    }
  };

  _requestIntegration = (integrationName, reqSocket, req) => new Promise(async (resolve) => {
    const { handleLoop } = this.integrations[integrationName].router;
    console.log(`${SeashellChalk} handle admin request: ${JSON.stringify(req)}`);
    const res = {
      headers: {
        importAppName: integrationName,
        appId: req.headers.appId,
        callbackId: req.headers.callbackId
      },
      body: {},
      end: () => {
        // resolve({
        //   headers: res.headers,
        //   body: res.body
        // })
        resolve(res)
      }
    };
    const next = (err, req, res, index, pathname) => {
      return handleLoop(err, req, res, next, index, pathname)
    };
    next(null, req, res, 0, req.headers.originUrl)
  });

  /**
   * handle `callback`
   */
  response = async (socket, res) => {
    try {
      if (!res.headers.appId) {
        if (!res.headers.appName) throw new Error('Export Lost appName!');
        if (this.integrations.hasOwnProperty(res.headers.appName)) {
          return this.integrationEmitterStack[res.headers.callbackId].emit('RESPONSE', res)
        }
        throw new Error('Export Lost Params: [appId]');
      }

      if (!res.headers.callbackId) console.log(`${SeashellChalk}Warning: Lost Params: [callbackId]`);

      /**
       * 根据appId找到socket
       * 如果目标在线, 发送消息
       */
      const reqSocket = await this.Socket.findByAppId({appId: res.headers.appId});
      this.io.sockets.connected[reqSocket.socketId].emit('YOUR_REQUEST_HAS_RESPONSE', res);
      console.log(
        `${SeashellChalk} ${reqSocket.appName} <-- ${res.headers.importAppName}${res.headers.originUrl},` +
        ` total spend ${Date.now() - res.headers.__SEASHELL_START}ms`
      )

    } catch(e) {
      console.log(e.stack);

      if (e.message == 'GET_SOCKET_FAIL') {
        // todo add to task, when socket connected again, send res again.
        return console.log(`${SeashellChalk} reqSocket offline`)
      }
    }
  };

}

export default Seashell