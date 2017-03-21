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
 */

import {splitUrl} from './splitUrl'
import Emitter from 'events'
import {Duplex} from 'stream'
import uuid from 'uuid'
import chalk from 'chalk'
const SeashellChalk = (msg) => chalk.blue.bold(`[Seashell] ${msg}`);
import {I_HAVE_A_REQUEST} from './emit-types'

/**
 * push a request to MQ hub.
 * @param url `/${appname}/${originUrl}`
 * @param data
 * @returns {Promise}
 *
 * use `socket.emit` to push request
 * push a event callback to importEmitterStack every request
 * listening on `RESPONSE` event and return data
 */
const request = function (url, data={}) {
  if (typeof data != 'object') throw `request data must be an object.`;
  const {importEmitterStack, appId, appName} = this.state;
  return new Promise( (resolve, reject) => {
    try {
      // if (!this.state.isOnline) return reject("YOUR_SERVICE_IS_OFFLINE");
      /**
       * parse url, create req object
       */
      const callbackId = uuid.v4();
      const req = {
        body: data,
        headers: Object.assign({
          appName,
          appId,
          callbackId
        }, splitUrl(url))
      };


      /**
       * set callback
       * @type {Emitter}
       */
      importEmitterStack[callbackId] = new Emitter();
      importEmitterStack[callbackId].on('RESPONSE', (res) => {
        resolve(res);
        delete importEmitterStack[callbackId];
        return null
      });

      /**
       * send request
       */
      this.socket.emit(I_HAVE_A_REQUEST, req)
    } catch(e) {
      console.log(SeashellChalk(`REQUEST_ERROR ${e.message||e}`));
      reject(e)
    }
  })
};

export {
  request
}