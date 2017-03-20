import {SeashellDebug} from './debug'
import {Context} from './App/Context'

const requestIntegration = function(toIntegrationName, req) {
  const {handleLoop} = this.integrations[toIntegrationName];
  return new Promise(async (resolve) => {
    // SeashellDebug('INFO', 'handle admin request', req);
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