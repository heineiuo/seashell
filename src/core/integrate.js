import {SeashellDebug} from './debug'

const integrate = function(integration){
  const {app, name} = integration;
  app.handler = integration.handler;
  app.state.isOnlie = true;
  app.state.isRegistered = true;
  app.socket = {
    isFromIntegration: true,
    emit: (type, data) => {
      const {importAppName, originUrl, __SEASHELL_START, status='DONE'} = data.headers;
      if (type == 'I_HAVE_A_REQUEST') {
        return this.onRequest(app.socket, data)
      }
      if (type == 'YOUR_REQUEST_HAS_RESPONSE') {
        SeashellDebug(status == 'ERROR'?'ERROR':'INFO',
          `[${name}] <--> [${importAppName}${originUrl}]` +
          `[${status}]` +
          (status == 'ERROR'? `[${data.body.error}]` : '' )+
          `[${Date.now() - __SEASHELL_START}ms]`
        );
        return app.handleResponse(data)
      }
      if (type == 'I_HAVE_HANDLE_THIS_REQUEST') {
        return this.onResponse(app.socket, data)
      }
    }
  };
  this.integrations[name] = app;
};

export {
  integrate
}