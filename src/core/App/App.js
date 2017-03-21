import SocketIOClient from 'socket.io-client'
import Router from './Router'
import {request} from './request'
import {send} from './send'
import {onRequest} from './onRequest'
import {onResponse} from './onResponse'
import * as log from '../log'
import {bindEventHandlers} from './bindEventHandlers'

class App extends Router {

  state = {
    /**
     * 是否启动
     */
    isStarted: false,
    /**
     * 是否已经连接上hub
     */
    isOnline: false,
    /**
     * 是否已经注册, 只有注册后才能调用其他service
     */
    isRegistered: false,

    importEmitterStack: {}
  };

  request = request.bind(this);
  send = send.bind(this);

  /**
   * request stream
   */
  requestStream = () => {
    // todo
  };


  onResponse = onResponse.bind(this);

  /**
   * connect to MQ hub.
   * @param opts
   * @returns {boolean}
   */
  connect = (opts={}) => {
    if (this.state.isStarted) return false;
    log.info(`connecting ${opts.url}`);
    const socket = this.socket = SocketIOClient(opts.url);
    Object.assign(this.state, {
      opts: opts,
      isStarted: true,
    });

    bindEventHandlers.call(this, socket)
  };

  /**
   * disconnect with server
   * @returns {boolean}
   */
  disconnect = () => {
    if (this.state.isStarted) {
      const {socket} = this.state;
      socket.disconnect()
    }
    log.info(` disconnected`)
  }
}

export default App
