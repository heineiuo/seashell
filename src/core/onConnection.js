import Url from 'url'
import {SeashellDebug} from './debug'

import {onChildSend} from './onChildSend'
import {onChildRequest} from './onChildRequest'
import {onChildResponse} from './onChildResponse'
import {onChildDisconnect} from './onChildDisconnect'
import {register} from './register'

/**
 * handle socket connection
 */
const onConnection = async function(socket) {
  if (!this.integrations.hasOwnProperty('service') ||
    !this.integrations.hasOwnProperty('account')) {
    throw new Error('Required integrated service not found')
  }

  // SeashellDebug('INFO', `new connection ${socket.id}`);
  const url = socket.url = Url.parse(socket.request.url, {parseQueryString: true});
  SeashellDebug('INFO', `[CONNECTION][${url.query.appName}][${url.query.appId}]`);
  try {
    await register.call(this, socket, url.query);
  } catch (e) {
    SeashellDebug('ERROR', e);
    return socket.disconnect(true)
  }

  /**
   * service want to request another service
   */
  socket.on('I_HAVE_A_REQUEST', (request) => {
    onChildRequest.call(this, socket, request)
  });

  /**
   * service has handled request from another, transfer data back to that.
   */
  socket.on('I_HAVE_HANDLE_THIS_REQUEST', (response) => {
    onChildResponse.call(this, socket, response)
  });

  socket.on('I_HAVE_A_SEND', (message) => {
    onChildSend.call(this, socket, message)
  });

  /**
   * handle disconnect
   */
  socket.on('disconnect', () => {
    onChildDisconnect.call(this, socket)
  })
};

export {
  onConnection
}