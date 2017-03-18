import {SeashellDebug} from './debug'
import Emitter from 'events'
import uuid from 'uuid'

const integrate = function(integration){
  const {integrations, integrationEmitterStack, onRequest} = this;
  const {name, router, handler} = integration;
  integrations[name] = {
    handler,
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
            SeashellDebug('INFO', 'INTEGRATION_GOT_RES');
            resolve(res);
            delete integrationEmitterStack[callbackId];
            return null
          });

          /**
           * send request
           */
          onRequest({integration: true}, req);
          SeashellDebug('INFO', `Integration ${name} Start request: ${url}`);
        } catch(e){
          SeashellDebug('ERROR', e);
          reject(e)
        }
      })
    }
  };

  router.request = integrations[name].request;
  this.integrations = integrations;
  return integrations[name]
};

export {
  integrate
}