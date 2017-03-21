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
      const socketData = await this.requestIntegration('service/socket/bindApp', {
        socketId: socket.id,
        registerInfo
      });
      SeashellDebug('INFO', `register success`, registerInfo.appId);
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {success: 1, socketData});
      resolve(registerInfo);
    } catch(e){
      SeashellDebug('INFO', 'register failed', e);
      socket.emit('YOUR_REGISTER_HAS_RESPONSE', {error: e.message});
      reject(e);
    }
  })
};

export {
  register
}