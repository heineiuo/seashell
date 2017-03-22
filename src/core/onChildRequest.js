import {SeashellDebug} from './debug'

const onChildRequest = async function(socket, req) {

  const {importAppName, originUrl, __SEASHELL_START, appName, appId} = req.headers;
  req.headers.__SEASHELL_START = Date.now();
  const isToSelf = importAppName == this.__SEASHELL_NAME;
  try {

    /**
     * ** 特殊处理 **
     * 任何请求头中带有的session都强制清空，需要经过seashell获取session
     * 首先从socket中获取用户session，如果socket是service，则根据请求头
     * 中的token获取用户session
     */
    req.headers.session = this.requestSession(req);


    /**
     * 发送请求
     * 如果请求的是集成服务, 则直接调用
     * 否则，先验证目标app是否在线, 在线则发包给目标app
     */
    if (isToSelf) {
      const result = await this.requestSelf(req);
      socket.emit('YOUR_REQUEST_HAS_RESPONSE', result);
    } else {
      const findResponseService = await this.requestSelf({
        headers: {
          originUrl: this.__SEASHELL_PICK_APP_URL
        },
        body: {
          appName: importAppName,
          appId
        }
      });
      const targetSocket = this.io.sockets.connected[findResponseService.body.socketId];
      if (!targetSocket) throw new Error('TARGET_SERVICE_OFFLINE');
      targetSocket.emit('PLEASE_HANDLE_THIS_REQUEST', req)
    }

  } catch(err) {
    req.headers.status = 'ERROR';
    req.body.error = err.message;
    socket.emit('YOUR_REQUEST_HAS_RESPONSE', req);

    SeashellDebug('ERROR',
      `[${appName}] --> [${importAppName}${originUrl}]` +
      `[ERROR][${err.message}][${Date.now() - __SEASHELL_START}ms]`
    );
  }
};

export {
  onChildRequest
}