import {Context} from './Context'
import {I_HAVE_HANDLE_THIS_REQUEST} from './emit-types'

const requestSelf = function(req) {
  let state = 0;
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
        if (state == 0) {
          state = 2;
          reject(new Error('ExceptionError'))
        }
      });
      console.log(req);
      this.handleLoop(ctx);
    } catch(e){
      reject(e)
    }
  });
};

export {
  requestSelf
}