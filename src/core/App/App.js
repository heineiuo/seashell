import SocketIOClient from 'socket.io-client'
import Router from './Router'
import chalk from 'chalk'
import {request} from './request'
import {send} from './send'
import {onRequest} from './onRequest'
import {onResponse} from './onResponse'

const SeashellChalk = (msg) => chalk.blue.bold(`[Seashell] ${msg}`);

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
    console.log(SeashellChalk(`connecting ${opts.url}`));
    const socket = this.socket = SocketIOClient(opts.url);
    Object.assign(this.state, {
      opts: opts,
      isStarted: true,
    });

    socket.on('connect', () => {
      console.log(SeashellChalk(` connected`));
      this.state.isOnline = true;
    });

    /**
     * handle hub's response about register
     * if there's some error, means register has failed
     * otherwise, it succeed
     */
    socket.on('YOUR_REGISTER_HAS_RESPONSE', (response) => {
      console.log(SeashellChalk(` registered`));
      console.log(response);
      this.state.appName= response.socketData.appName;
      this.state.isRegistered = true;
    });

    /**
     * handle response
     * response should have `callbackId` key.
     */
    socket.on('YOUR_REQUEST_HAS_RESPONSE', this.onResponse);

    /**
     * handle request
     */
    socket.on('PLEASE_HANDLE_THIS_REQUEST', onRequest.bind(this));

    /**
     * listing disconnect event
     */
    socket.on('disconnect', () => {
      console.log(SeashellChalk(` lost connection`));
      this.state.isOnline = false
    })
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
    console.log(SeashellChalk(` disconnected`))
  }
}

export default App
