import {SeashellDebug} from './debug'

const onChildDisconnect = function(socket) {
  const deleteSocket = async(socketId, retry = 0) => {
    try {
      SeashellDebug('INFO', `${socketId} disconnected`);
      await this.requestIntegration('service/socket/remove', {socketId})
    } catch (e) {
      if (retry < 3) {
        retry++;
        deleteSocket(socketId, retry)
      }
    }
  };
  deleteSocket(socket.id)
};

export {
  onChildDisconnect
}