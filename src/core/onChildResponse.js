import {SeashellDebug} from "./debug"

const onChildResponse = async function (socket, res) {

  const {appName, appId, callbackId, callbackAppId, importAppName, originUrl, __SEASHELL_START} = res.headers;

  /**
   * 如果没有callbackId, drop这个处理（用于send请求，仅发送消息）
   * 如果请求来自requestChild, 触发callback emit
   * 否则如果没有appId或appName, 该响应非法
   * 否则根据appName和appId找到socket，
   * 存在不在线的情况，需要做丢弃或者离线处理（离线处理涉及到callbackId的存储问题）
   */
  if (!callbackId) return null;

  try {
    if (res.headers.appName === this.__SEASHELL_NAME) {
      try {
        this.importEmitterStack[callbackId].emit('RESPONSE', res);
      } catch(e) {}
      return null
    }

    if (!appId || !appName) return null;

    const findRequestApp = await this.requestSelf({headers: {
      originUrl: this.__SEASHELL_SOCKET_QUERY_URL,
      originUrlDescription: '__SEASHELL_SOCKET_QUERY_URL'
    }, body: {
      appId: callbackAppId ? callbackAppId: appId,
      appName
    }});
    const requestSocket = this.io.sockets.connected[findRequestApp.body.socketId] || null;

    if (!requestSocket) {
      // todo add to task, when socket connected again, send res again.
      return SeashellDebug('WARN', `the request app offline, maybe resent response later...`)
    }

    requestSocket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
    SeashellDebug('INFO',
      `[${requestSocket.appName}] --> [${importAppName}${originUrl}]` +
      `[DONE][${Date.now() - __SEASHELL_START}ms]`
    );

  } catch (e) {
    SeashellDebug('ERROR', e);
  }
};

export {
  onChildResponse
}