import {SeashellDebug} from './debug'
import {Context} from '../client/Context'

const requestIntegration = function(integrationName, reqSocket, req) {
  const {handleLoop} = this.integrations[integrationName].app;

  return new Promise(async (resolve) => {
    SeashellDebug('INFO', 'handle admin request', req);
    Object.assign(req, {params: {}});
    const ctx = new Context({
      emit: (type) => {
        if (type == 'I_HAVE_HANDLE_THIS_REQUEST') {
          resolve(ctx.response)
        }
      }
    }, req);
    handleLoop(ctx);
  });
};

export {
  requestIntegration
}