import chalk from 'chalk'
const SeashellChalk = (msg) => chalk.blue.bold(`[Seashell] ${msg}`);
import {Context} from './Context'

  /**
   * receive & handle message from hub
   * @param req
   */
const onRequest = async (req) => {
  try {
    console.log(SeashellChalk(`handle request: ${req.headers.originUrl}`));
    const ctx = new Context(this.socket, req);
    this.handleLoop(ctx);
  } catch(e){
    console.log(e)
  }

};

export {
  onRequest
}