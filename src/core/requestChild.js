import uuid from 'uuid'
import {SeashellDebug} from './debug'
import {splitUrl} from './splitUrl'
import Emitter from 'events'
import {clearUnsafeHeaders} from './clearUnsafeHeaders'

const requestChild = async function (url, data={}, options={needCallback: true}) {

  const {importAppName, originUrl} = splitUrl(url);
  const needCallback = options.needCallback || true;

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
  };


  return new Promise(async (resolve, reject) => {
    try {

      req.headers.session = await this.requestSession(req);


      /**
       * 发送请求
       * 如果请求的是集成服务, 则直接调用
       * 否则，先验证目标app是否在线, 在线则发包给目标app
       */
      if (importAppName === this.__SEASHELL_NAME) {
        const res = await this.requestSelf(req);
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
      });
      const targetSocket = this.__connections[findResponseService.body.socketId];
      if (!targetSocket) throw new Error(findResponseService.body.error || 'TARGET_SERVICE_OFFLINE');

      if (needCallback){
        const callbackId = req.headers.callbackId = uuid.v4();
        const callback = (res) => {
          delete this.importEmitterStack[callbackId];
          resolve(res);
          SeashellDebug('INFO',
            `[${this.__SEASHELL_NAME}] --> [${importAppName}${originUrl}]` +
            `[DONE][${Date.now() - req.headers.__SEASHELL_START}ms]`
          );
          return null
        };
        this.importEmitterStack[callbackId] = new Emitter();
        this.importEmitterStack[callbackId].on('RESPONSE', callback);
        setTimeout(() => {
          try {
            this.importEmitterStack[callbackId].off('RESPONSE', callback);
            delete this.importEmitterStack[callbackId];
          } catch(e){}
          return null
        }, this.__SEASHELL_REQUEST_TIMEOUT)

      } else {
        resolve()
      }

      req.headers.type = 'PLEASE_HANDLE_THIS_REQUEST'
      targetSocket.send(clearUnsafeHeaders(req))

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
