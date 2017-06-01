import {SeashellDebug} from './debug'
import {clearUnsafeHeaders} from './clearUnsafeHeaders'

/**
 * register app
 * @param socket
 * @param registerInfo
 */
const register = function(socket, registerInfo) {

  return new Promise(async (resolve, reject) => {
    try {
      if (!socket.id) throw new Error('LOST_SOCKET_ID');
      const socketData = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SOCKET_BIND_URL,
          originUrlDescription: '__SEASHELL_SOCKET_BIND_URL',
        },
        body: {
          socketId: socket.id,
          registerInfo
        }
      });
      if (socketData.body.error) throw new Error(socketData.body.error);
      socket.send(clearUnsafeHeaders({
        headers: {type: 'YOUR_REGISTER_HAS_RESPONSE'},
        body: {success: 1, socketData: socketData.body}
      }));
      resolve(socketData.body);
    } catch(e){
      try {
        socket.send(clearUnsafeHeaders({
          headers: {type: 'YOUR_REGISTER_HAS_RESPONSE'},
          body: {error: e.message}
        }));
      } catch(e){
        console.log('send fail' + e)
      }
      reject(e);
    }
  })
};

export {
  register
}
