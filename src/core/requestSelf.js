import {Context} from './Context'
import {I_HAVE_HANDLE_THIS_REQUEST} from './emit-types'
import {SeashellDebug} from './debug'

const requestSelf = function(req) {
  let state = 0; // 0 initial 1 success 2 error

  // see onChildRequest
  req.headers.session = this.requestSession(req);

  return new Promise(async (resolve, reject) => {
    try {
      const ctx = new Context({
        emit: (type, response) => {
          if (type == I_HAVE_HANDLE_THIS_REQUEST) {
            state = 1;
            resolve(response)
          } else {
            state = 2;
            reject()
          }
        }
      }, req);

      ctx.on('end', () => {
        process.nextTick(
          () => {
            if (!ctx.state.isHandled) {
              SeashellDebug('WARN', `A no response request happened, please check ${req.headers.originUrl}.`);
              ctx.response.body = {error: 'NOT_FOUND'};
              ctx.response.end();
              resolve(ctx.response)
            }
          }
        )
      });
      this.handleLoop(ctx);
    } catch(e){
      reject(e)
    }
  });
};

export {
  requestSelf
}