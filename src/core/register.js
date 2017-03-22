import {SeashellDebug} from './debug'


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
          originUrl: this.__SEASHELL_BIND_SOCKET_URL,
        },
        body: {
          socketId: socket.id,
          registerInfo
        }
      });
      if (socketData.body.error) throw new Error(socketData.body.error);
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {success: 1, socketData: socketData.body});
      resolve(socketData.body);
    } catch(e){
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {error: e.message});
      reject(e);
    }
  })
};

export {
  register
}