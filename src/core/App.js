import SocketIOClient from 'socket.io-client'
import Router from './Router'
import {request} from './request'
import {onRequest} from './onRequest'
import {requestSelf} from './requestSelf'
import {onResponse} from './onResponse'
import * as log from './log'
import {bindEventHandlers} from './bindEventHandlers'

class App extends Router {

  appState = 0;
  importEmitterStack = {};
  request = request.bind(this);
  onRequest = onRequest.bind(this);
  onResponse = onResponse.bind(this);
  requestSelf = requestSelf.bind(this);

  /**
   * connect to MQ hub.
   * @param opts
   * @returns {boolean}
   */
  connect = (opts={}) => {
    if (this.appState > 0) return false;
    log.info(`connecting ${opts.url}`);
    this.socket = SocketIOClient(opts.url);
    this.appState = 1;
    this.appOptions = opts;
    bindEventHandlers.call(this)
  };

  /**
   * disconnect with server
   * @returns {boolean}
   */
  disconnect = () => {
    if (this.appState > 0) {
      this.socket.disconnect()
    }
    log.info(`disconnected`)
  }
}

export default App
