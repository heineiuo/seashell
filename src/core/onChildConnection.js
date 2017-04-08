import Url from 'url'
import {SeashellDebug} from './debug'
import ss from 'socket.io-stream'
import {register} from './register'

/**
 * handle socket connection
 */
const onChildConnection = async function(rawSocket) {


  const url = Url.parse(rawSocket.request.url, {parseQueryString: true});
  SeashellDebug('INFO', `[new connection: ${url.query.appName}, ${url.query.appId}]`);

  const socket = ss(rawSocket).sio;
  try {
    const socketData = await register.call(this, socket, url.query);
    SeashellDebug('INFO', `${socketData.appName} register success, id: ${socketData.appId}`);
  } catch (e) {
    SeashellDebug('ERROR', `${url.query.appName} register failed: ${e.message}`);
    return socket.disconnect(true)
  }

  /**
   * service want to request another service
   */
  socket.on('I_HAVE_A_REQUEST', (request) => {
    process.nextTick(() => this.onChildRequest(socket, request))
  });

  /**
   * service has handled request from another, transfer data back to that.
   */
  socket.on('I_HAVE_HANDLE_THIS_REQUEST', (response) => {
    process.nextTick(() => this.onChildResponse(socket, response))
  });

  /**
   * handle disconnect
   */
  socket.on('disconnect', () => {
    this.onChildDisconnect(socket)
  })
};

export {
  onChildConnection
}