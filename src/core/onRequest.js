import {SeashellDebug} from './debug'


const onRequest = async function(socket, req) {

  const {
    io,
    integrations,
    integrations: {service},
    requestIntegration,
  } = this;
  const {importAppName, originUrl, __SEASHELL_START, appName} = req.headers;
  const isFromIntegration = socket.hasOwnProperty('isFromIntegration');
  const isToIntegration = integrations.hasOwnProperty(importAppName);

  try {
    if (!req.headers.callbackId) throw new Error('LOST_CALLBACK_ID');
    req.headers.__SEASHELL_START = Date.now();
    req.headers.isFromIntegration = isFromIntegration;


    /**
     * 验证请求是否合法
     * 如果请求来自集成服务, 跳过验证
     */
    if (isFromIntegration) {
      // SeashellDebug('INFO', `[integrate] --> ${importAppName}${originUrl}`);
    } else {
      const reqService = await service.handler('socket', {
        action: 'detail',
        socketId: socket.id
      });
      // SeashellDebug('INFO', `${reqService.appName} --> ${importAppName}${originUrl}`);
    }

    /**
     * 发送请求
     * 如果请求的是集成服务, 则直接调用
     * 否则，先验证目标app是否在线, 在线则发包给目标app
     */
    if (isToIntegration) {

      const res = await requestIntegration(importAppName, req);
      // if (isFromIntegration) {
      //   integrationEmitterStack[req.headers.callbackId].emit('RESPONSE', res);
      // } else {
        socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
      // }

    } else {
      const resServiceId = await service.handler('socket', {request: {body: { action: 'balance', importAppName}}});
      // console.log('resServiceId: '+resServiceId)
      // console.log(io.sockets.connected[resServiceId]);
      const targetSocket = io.sockets.connected[resServiceId];
      if (!targetSocket) throw new Error('TARGET_SERVICE_OFFLINE');
      io.sockets.connected[resServiceId].emit('PLEASE_HANDLE_THIS_REQUEST', req)
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