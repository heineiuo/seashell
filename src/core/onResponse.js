import {SeashellDebug} from './debug'

/**
 * handle `callback`
 */
const onResponse = async function(socket, res) {
  const {
    integrations,
    integrations: {service},
    io
  } = this;

  const isToIntegrate = integrations.hasOwnProperty(res.headers.appName);

  try {
    if (!res.headers.appId) {
      if (!res.headers.appName) throw new Error('Export Lost appName!');
      if (isToIntegrate) {
        return integrations[res.headers.appName].emit('YOUR_REQUEST_HAS_RESPONSE', res);
      }
      throw new Error('Export Lost Params: [appId]');
    }

    if (!res.headers.callbackId) SeashellDebug('WARN', 'Lost Params: [callbackId]');

    /**
     * 根据appId找到socket
     * 如果目标在线, 发送消息
     */
    const reqSocket = await service.handler('socket', { action: 'findByAppId', appId: res.headers.appId});
    io.sockets.connected[reqSocket.socketId].emit('YOUR_REQUEST_HAS_RESPONSE', res);
    SeashellDebug('INFO',
      `${SeashellChalk} ${reqSocket.appName} <-- ${res.headers.importAppName}${res.headers.originUrl},` +
      ` total spend ${Date.now() - res.headers.__SEASHELL_START}ms`
    )

  } catch(e) {
    SeashellDebug('ERROR', e);

    if (e.message == 'GET_SOCKET_FAIL') {
      // todo add to task, when socket connected again, send res again.
      return SeashellDebug('WARN', `reqSocket offline`)
    }
  }
};

export {
  onResponse
}