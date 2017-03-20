import {SeashellDebug} from './debug'

const onDisconnect = function(socket) {
  const deleteSocket = async(socketId, retry = 0) => {
    try {
      SeashellDebug('INFO', `${socketId} disconnected`);
      await this.requestIntegration('service', { reducerName: 'socket', action: 'remove', socketId})
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
  onDisconnect
}