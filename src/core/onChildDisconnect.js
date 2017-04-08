import {SeashellDebug} from './debug'

const onChildDisconnect = function(socket) {
  const deleteSocket = (socketId, retry = 0) => {
    try {
      SeashellDebug('INFO', `${socketId} disconnected`);
      this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SOCKET_UNBIND_URL,
          originUrlDescription: '__SEASHELL_SOCKET_UNBIND_URL'
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