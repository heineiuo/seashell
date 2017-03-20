import {SeashellDebug} from './debug'
import {Context} from './App/Context'

const proxyIntegration = function(importAppName, request) {
  try {
    const {handleLoop} = this.integrations[importAppName];
    return new Promise(async (resolve, reject) => {
      // SeashellDebug('INFO', 'handle integrate request', req);
      try {
        const ctx = new Context({
          emit: (type) => {
            if (type == 'I_HAVE_HANDLE_THIS_REQUEST') {
              resolve(ctx.response)
            } else {
              reject()
            }
          }
        }, request);
        handleLoop(ctx);
      } catch(e){
        reject(e)
      }

    });
  } catch(e){
    throw e
  }

};

export {
  proxyIntegration
}