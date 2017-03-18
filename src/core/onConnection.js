import Url from 'url'
import {SeashellDebug} from './debug'

/**
 * handle socket connection
 */
const onConnection = async function(socket) {
  if (!this.integrations.hasOwnProperty('service') ||
    !this.integrations.hasOwnProperty('account')) {
    throw new Error('Required integrated service not found')
  }

  SeashellDebug('INFO', `new connection ${socket.id}`);
  const url = socket.url = Url.parse(socket.request.url, {parseQueryString: true});

  SeashellDebug('INFO', url.query);

  try {
    await this.register(socket, url.query);
  } catch (e) {
    SeashellDebug('ERROR', e);
    return socket.disconnect(true)
  }

  /**
   * service want to request another service
   */
  socket.on('I_HAVE_A_REQUEST', (request) => {
    this.onRequest(socket, request)
  });

  /**
   * service has handled request from another, transfer data back to that.
   */
  socket.on('I_HAVE_HANDLE_THIS_REQUEST', (response) => {
    this.onResponse(socket, response)
  });

  socket.on('I_HAVE_A_SEND', (message) => {
    this.onSend(socket, message)
  });

  /**
   * handle disconnect
   */
  socket.on('disconnect', () => {
    this.onDisconnect(socket)
  })
};

export {
  onConnection
}