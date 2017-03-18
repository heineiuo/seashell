import {SeashellDebug} from './debug'

const requestIntegration = function(integrationName, reqSocket, req) {
  const {
    integrations
  } = this;
  return new Promise(async (resolve) => {
    const { handleLoop } = integrations[integrationName].router;
    SeashellDebug('INFO', 'handle admin request', req);
    const res = {
      headers: {
        importAppName: integrationName,
        appId: req.headers.appId,
        callbackId: req.headers.callbackId
      },
      body: {},
      end: () => {
        // resolve({
        //   headers: res.headers,
        //   body: res.body
        // })
        resolve(res)
      }
    };
    const next = (err, req, res, index, pathname) => {
      return handleLoop(err, req, res, next, index, pathname)
    };
    next(null, req, res, 0, req.headers.originUrl)
  });
};

export {
  requestIntegration
}