import {Context} from './Context'
import * as log from './log'

/**
 * receive & handle message from hub
 * @param req
 */
const onRequest = async (req) => {
  try {
    log.info(`handle request: ${req.headers.originUrl}`);
    const ctx = new Context(this.socket, req);
    this.handleLoop(ctx);
  } catch(e){
    log.info(e.message)
  }
};

export {
  onRequest
}