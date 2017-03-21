/**
 * 内部请求流程
 *
 * 1. 集成app1, 给app1添加虚拟的socket，
 * 2. 集成app2，同上
 * 3. seashell请求app1，首先执行requestIntegration, 模拟socket和ctx
 */

import {SeashellDebug} from './debug'

const integrate = function(integration){
  const {app, name} = integration;
  app.state.isOnlie = true;
  app.state.isRegistered = true;
  app.socket = {
    isFromIntegration: true,
    emit: (type, data) => {
      const {importAppName, originUrl, __SEASHELL_START, status='DONE'} = data.headers;
      if (type == 'I_HAVE_A_REQUEST') {
        return this.onChildRequest(app.socket, data)
      }
      if (type == 'YOUR_REQUEST_HAS_RESPONSE') {
        SeashellDebug(status == 'ERROR'?'ERROR':'INFO',
          `[${name}] <--> [${importAppName}${originUrl}]` +
          `[${status}]` +
          (status == 'ERROR'? `[${data.body.error}]` : '' )+
          `[${Date.now() - __SEASHELL_START}ms]`
        );
        return app.onResponse(data)
      }
      if (type == 'I_HAVE_HANDLE_THIS_REQUEST') {
        return this.onChildResponse(app.socket, data)
      }
    }
  };
  this.integrations[name] = app;
};

export {
  integrate
}