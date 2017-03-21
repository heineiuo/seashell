import {SeashellDebug} from './debug'

const onRequest = async function(socket, req) {

  const {io, integrations, requestIntegration, proxyIntegration} = this;
  const {importAppName, originUrl, __SEASHELL_START, appName, appId, callbackId} = req.headers;
  const isFromIntegration = socket.hasOwnProperty('isFromIntegration');
  const isToIntegration = integrations.hasOwnProperty(importAppName);

  try {
    if (!req.headers.callbackId) throw new Error('LOST_CALLBACK_ID');
    req.headers.__SEASHELL_START = Date.now();
    req.headers.isFromIntegration = isFromIntegration;

    /**
     * 1. 获取用户session
     * 2. 验证请求是否合法
     * 如果请求来自集成服务, 跳过验证
     */

    try {
      // console.log('START REQUEST FOR USER SESSION');
      const requestSession = await requestIntegration('/account/session', {
        token: req.body.token,
      });
      Object.assign(req.headers, {session: requestSession.body});
    } catch(e){
      Object.assign(req.headers, {session: null});
    }

    if (isFromIntegration) {
      // SeashellDebug('INFO', `[integrate] --> ${importAppName}${originUrl}`);
    } else {
      try {
        const reqService = await requestIntegration('service/socket/detail', {
          socketId: socket.id
        });
        // SeashellDebug('INFO', `${reqService.appName} --> ${importAppName}${originUrl}`);
      } catch(e){
        console.log(e)
      }

    }

    /**
     * 发送请求
     * 如果请求的是集成服务, 则直接调用
     * 否则，先验证目标app是否在线, 在线则发包给目标app
     */
    if (isToIntegration) {

      const res = await proxyIntegration(importAppName, req);
      // if (isFromIntegration) {
      //   integrationEmitterStack[req.headers.callbackId].emit('RESPONSE', res);
      // } else {
      socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
      // }

    } else {
      const resServiceId = await requestIntegration('service/socket/balance', {
        importAppName
      });
      // console.log('resServiceId: '+resServiceId)
      // console.log(io.sockets.connected[resServiceId]);
      const targetSocket = io.sockets.connected[resServiceId];
      if (!targetSocket) throw new Error('TARGET_SERVICE_OFFLINE');
      targetSocket.emit('PLEASE_HANDLE_THIS_REQUEST', req)
    }
  } catch(err) {
    req.headers.status = 'ERROR';
    req.body.error = err.message;
    socket.emit('YOUR_REQUEST_HAS_RESPONSE', req);
    if (!isFromIntegration) {
      SeashellDebug('ERROR',
        `[${appName}] --> [${importAppName}${originUrl}]` +
        `[ERROR][${err.message}][${Date.now() - __SEASHELL_START}ms]`
      );
    }

  }
};

export {
  onRequest
}