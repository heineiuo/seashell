import {SeashellDebug} from './debug'

const onChildDisconnect = function(socket) {
  const deleteSocket = async(socketId, retry = 0) => {
    try {
      SeashellDebug('INFO', `${socketId} disconnected`);
      this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_UNBIND_SOCKET_URL
        },
        body: {socketId}
      })
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