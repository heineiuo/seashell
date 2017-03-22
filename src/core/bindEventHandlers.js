import * as log from './log'

const bindEventHandlers = function () {
  this.socket.on('connect', () => {
    log.info(` connected`);
    this.appState = 2;
  });

  /**
   * handle hub's response about register
   * if there's some error, means register has failed
   * otherwise, it succeed
   */
  this.socket.on('YOUR_REGISTER_HAS_RESPONSE', (response) => {
    log.info(`registered`);
    this.appState = 3;
  });

  /**
   * handle response
   * response should have `callbackId` key.
   */
  this.socket.on('YOUR_REQUEST_HAS_RESPONSE', this.onResponse);

  /**
   * handle request
   */
  this.socket.on('PLEASE_HANDLE_THIS_REQUEST', this.onRequest);

  /**
   * listing disconnect event
   */
  this.socket.on('disconnect', () => {
    log.info(` lost connection`);
    this.appState = 0;
  })
};

export {
  bindEventHandlers
}