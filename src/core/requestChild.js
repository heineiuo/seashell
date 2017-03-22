import uuid from 'uuid'
import {SeashellDebug} from './debug'
import {splitUrl} from './splitUrl'
import Emitter from 'events'

const requestChild = function (url, data={}, options={needCallback: false}) {

  const {importAppName, originUrl} = splitUrl(url);
  const {needCallback} = options;

  const req = {
    body: data,
    headers: Object.assign({
      appName: this.__SEASHELL_NAME,
      appId: 'SEASHELL',
      __SEASHELL_START: Date.now()
    }, {
      importAppName, originUrl
    })
  };


  if (importAppName == this.__SEASHELL_NAME) {
    return this.requestSelf(req);
  }

  // see onChildRequest
  req.headers.session = this.requestSession(req);

  return new Promise(async (resolve, reject) => {
    try {
      /**
       * 发送请求
       * 如果请求的是集成服务, 则直接调用
       * 否则，先验证目标app是否在线, 在线则发包给目标app
       */
      const findResponseService = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_PICK_APP_URL
        },
        body: {
          appName: importAppName
        }
      });
      const targetSocket = this.io.sockets.connected[findResponseService.body.socketId];
      if (!targetSocket) throw new Error('TARGET_SERVICE_OFFLINE');


      if (needCallback){
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

      targetSocket.emit('PLEASE_HANDLE_THIS_REQUEST', req)

    } catch(err) {
      req.headers.status = 'ERROR';
      req.body.error = err.message;

      SeashellDebug('ERROR',
        `[${this.__SEASHELL_NAME}] --> [${importAppName}${originUrl}]` +
        `[ERROR][${err.message}][${Date.now() - req.headers.__SEASHELL_START}ms]`
      );

      resolve(req);
    }
  })

};

export {
  requestChild
}