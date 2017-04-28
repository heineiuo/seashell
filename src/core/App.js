import Router from './Router'
import WebSocket from 'ws'
import {request} from './request'
import {onRequest} from './onRequest'
import {requestSelf} from './requestSelf'
import {onResponse} from './onResponse'
import {bindEventHandlers} from './bindEventHandlers'

class App extends Router {

  appState = 0;
  importEmitterStack = {};
  request = request.bind(this);
  onRequest = onRequest.bind(this);
  onResponse = onResponse.bind(this);
  requestSelf = requestSelf.bind(this);

  __SEASHELL_REQUEST_TIMEOUT = 300000;

  /**
   * connect to MQ hub.
   * @param opts
   * @returns {boolean}
   */
  connect = (opts={}) => {
    if (this.appState > 0) return false;
    console.info(`[Seashell] connecting ${opts.url}`);
    this.socket = new WebSocket(opts.url)
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
      this.socket.close()
    }
    console.info(`[Seashell] disconnected`)
  }
}

export default App
