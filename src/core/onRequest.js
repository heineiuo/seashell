import {Context} from './Context'

/**
 * receive & handle message from hub
 * @param req
 */
const onRequest = async function (req) {
  try {
    console.info(`[Seashell] handle request: ${req.headers.originUrl}`);
    const ctx = new Context(this.socket, req);
    this.handleLoop(ctx);
  } catch(e){
    console.info(`[Seashell] ${e.message}`)
  }
};

export {
  onRequest
}
