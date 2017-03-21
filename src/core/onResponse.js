import {SeashellDebug} from "./debug"

/**
 * handle `callback`
 */
const onResponse = async function (socket, res) {
  const {
    integrations,
    integrations: {service},
    io
  } = this;

  const {appId, appName, isFromIntegration, importAppName, originUrl, __SEASHELL_START, callbackId} = res.headers;

  try {
    // if (!callbackId) {
    //   return SeashellDebug('ERROR',
    //     `[unknown] --> [${importAppName}${originUrl}]` +
    //     `[ERROR][ILLEGAL_HEADER][${Date.now() - __SEASHELL_START}ms]`
    //   );
    // }

    if (isFromIntegration) {
      return integrations[appName].socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
    }

    /**
     * 根据appId找到socket
     * 如果目标在线, 发送消息
     */
    const reqSocket = await this.requestIntegration('service/socket/findByAppId', {
      appId: res.headers.appId
    });
    const targetFromSocket = io.sockets.connected[reqSocket.socketId];
    if (!targetFromSocket) throw new Error('GET_SOCKET_FAIL');
    Object.assign(res.headers, {appId, callbackId});
    targetFromSocket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
    SeashellDebug('INFO',
      `[${reqSocket.appName}] --> [${importAppName}${originUrl}]` +
      `[DONE][${Date.now() - __SEASHELL_START}ms]`
    );

  } catch (e) {
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