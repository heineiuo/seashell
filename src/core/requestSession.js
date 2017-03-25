const requestSession = function(req, socket={}){
  return new Promise(async resolve => {
    try {
      const requestSession = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SOCKET_SESSION_URL,
          originUrlDescription: '__SEASHELL_SOCKET_SESSION_URL'
        },
        body: {
          headers: req.headers,
          socketId: socket.id
        },
      });
      if (requestSession.body.error) return resolve(null);
      resolve(requestSession.body)
    } catch(e){
      resolve(null)
    }
  });
};

export {
  requestSession
}