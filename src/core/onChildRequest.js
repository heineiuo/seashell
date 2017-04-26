import {SeashellDebug} from './debug'
import {clearUnsafeHeaders} from './clearUnsafeHeaders'

const onChildRequest = async function(socket, req) {

  const {importAppName, originUrl, __SEASHELL_START, appName, appId} = req.headers;
  req.headers.__SEASHELL_START = Date.now();
  const isToSelf = importAppName === this.__SEASHELL_NAME;


  try {
    req.headers.session = await this.requestSession(req, socket);

    /**
     * 发送请求
     * 如果请求的是集成服务, 则直接调用
     * 否则，先验证目标app是否在线, 在线则发包给目标app
     */
    if (isToSelf) {
      const result = await this.requestSelf(req);
      result.headers.type = 'YOUR_REQUEST_HAS_RESPONSE';
      socket.send(clearUnsafeHeaders(result));
    } else {
      const findResponseService = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_SOCKET_QUERY_URL,
          originUrlDescription: '__SEASHELL_SOCKET_QUERY_URL'
        },
        body: {
          appName: importAppName,
          appId
        }
      });
      const targetSocket = this.io.sockets.connected[findResponseService.body.socketId];
      if (!targetSocket) throw new Error(findResponseService.body.error || 'TARGET_SERVICE_OFFLINE');

      req.headers.type = 'PLEASE_HANDLE_THIS_REQUEST';
      targetSocket.send(clearUnsafeHeaders(req))
    }

  } catch(err) {
    req.headers.status = 'ERROR';
    req.body.error = err.message;
    req.headers.type = 'YOUR_REQUEST_HAS_RESPONSE';
    socket.send(clearUnsafeHeaders(req));

    SeashellDebug('ERROR',
      `[${appName}] --> [${importAppName}${originUrl}]` +
      `[ERROR][${err.message}][${Date.now() - __SEASHELL_START}ms]`
    );
  }
};

export {
  onChildRequest
}
