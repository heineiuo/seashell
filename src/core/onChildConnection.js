import Url from 'url'
import uuid from 'uuid'
import {SeashellDebug} from './debug'
import {register} from './register'
import {parseBuffer} from './clearUnsafeHeaders'

/**
 * handle socket connection
 */
const onChildConnection = async function(socket) {

  const url = Url.parse(socket.upgradeReq.url, {parseQueryString: true});
  SeashellDebug('INFO', `[new connection: ${url.query.appName}, ${url.query.appId}]`);
  socket.id = uuid.v1();
  this.__connections[socket.id] = socket;

  try {
    const socketData = await register.call(this, socket, url.query);
    SeashellDebug('INFO', `${url.query.appName} register success, id: ${url.query.appId}`);
  } catch (e) {
    SeashellDebug('ERROR', `${url.query.appName} register failed: ${e.message}`);
    return socket.close()
  }

  socket.on('message', (buf) => {
    const data = parseBuffer(buf)
    if (data.headers.type === 'I_HAVE_A_REQUEST') {
      process.nextTick(() => this.onChildRequest(socket, data))
    } else if ( data.headers.type === 'I_HAVE_HANDLE_THIS_REQUEST') {
      process.nextTick(() => this.onChildResponse(socket, data))
    }
  });

  /**
   * handle disconnect
   */
  socket.on('close', () => {
    delete this.__connections[socket.id];
    this.onChildDisconnect(socket)
  })
};

export {
  onChildConnection
}
