import * as log from '../log'
import {onRequest} from './onRequest'

const bindEventHandlers = function (socket) {
  socket.on('connect', () => {
    log.info(` connected`);
    this.state.isOnline = true;
  });

  /**
   * handle hub's response about register
   * if there's some error, means register has failed
   * otherwise, it succeed
   */
  socket.on('YOUR_REGISTER_HAS_RESPONSE', (response) => {
    log.info(`registered`);
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
    log.info(` lost connection`);
    this.state.isOnline = false
  })
};

export {
  bindEventHandlers
}