import Url from 'url'
import {SeashellDebug} from './debug'
import ss from 'socket.io-stream'
import {register} from './register'

/**
 * handle socket connection
 */
const onConnection = async function(rawSocket) {

  const socket = ss(rawSocket);

  const url = Url.parse(socket.request.url, {parseQueryString: true});
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
    this.onChildRequest(socket, request)
  });

  /**
   * service has handled request from another, transfer data back to that.
   */
  socket.on('I_HAVE_HANDLE_THIS_REQUEST', (response) => {
    this.onChildResponse(socket, response)
  });


  /**
   * handle disconnect
   */
  socket.on('disconnect', () => {
    this.onChildDisconnect(socket)
  })
};

export {
  onConnection
}