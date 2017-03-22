const requestSession = function(req){
  return new Promise(async resolve => {
    try {
      if (!req.body.token) return resolve(null);
      const requestSession = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SESSION_URL
        },
        body: {token: req.body.token},
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