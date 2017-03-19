import {SeashellDebug} from './debug'


const onRequest = async function(socket, req) {

  const {
    io,
    integrations,
    integrations: {service},
    requestIntegration,
  } = this;
  const {importAppName, originUrl} = req.headers;
  const isFromIntegration = socket.hasOwnProperty('isFromIntegration');
  const isToIntegration = integrations.hasOwnProperty(importAppName);

  try {
    if (!req.headers.callbackId) throw new Error('LOST_CALLBACK_ID');
    req.headers.__SEASHELL_START = Date.now();


    /**
     * 验证请求是否合法
     * 如果请求来自集成服务, 跳过验证
     */
    if (isFromIntegration) {
      SeashellDebug('INFO', `[integrate] --> ${importAppName}${originUrl}`);
    } else {
      const reqService = await service.handler('socket', {
        action: 'detail',
        socketId: socket.id
      });
      SeashellDebug('INFO', `${reqService.appName} --> ${importAppName}${originUrl}`);
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
      const resServiceId = await service.handler('socket', { action: 'balance', importAppName});
      io.sockets.connected[resServiceId].emit('PLEASE_HANDLE_THIS_REQUEST', req)
    }
  } catch(e) {
    SeashellDebug('ERROR', 'request failed', e);
    const res = {
      headers: {
        callbackId: req.headers.callbackId
      },
      body: {
        error: e.message
      }
    };
    // socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
    // if (isFromIntegration) {
    //   integrationEmitterStack[req.headers.callbackId].emit('RESPONSE', res);
    // } else {
      socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
    // }
  }
};

export {
  onRequest
}