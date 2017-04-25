import * as log from './log'

const bindEventHandlers = function () {
  this.socket.on('open', () => {
    log.info(`connected`);
    this.appState = 2;
  });


  this.socket.on('message', (data, flags) => {
    console.log(data)
    if (data.type ===  'YOUR_REGISTER_HAS_RESPONSE') {
      log.info(`registered`);
      this.appState = 3;
    } else if (data.type === 'YOUR_REQUEST_HAS_RESPONSE') {
      this.onResponse(data, flags)
    } else if (data.type === 'PLEASE_HANDLE_THIS_REQUEST') {
      this.onRequest(data, flags)
    }
  });

  this.socket.on('error', (err) => {
    log.error(err)
  })

  /**
   * listing disconnect event
   */
  this.socket.on('close', () => {
    console.log('disconnect');
    log.info(`lost connection`);
    this.appState = 0;
    this.connect(this.appOptions)
  });
};

export {
  bindEventHandlers
}