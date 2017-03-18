import {SeashellDebug} from './debug'

const onDisconnect = function(socket) {
  const {integrations: {service}} = this;
  const deleteSocket = async(socketId, retry = 0) => {
    try {
      SeashellDebug('INFO', `${socketId} disconnected`);
      await service.handler({reducerName: 'socket', action: 'remove', socketId})
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