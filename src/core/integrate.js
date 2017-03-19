
const integrate = function(integration){
  const {app} = integration;
  app.handler = integration.handler;
  app.state.isOnlie = true;
  app.state.isRegistered = true;
  app.state.socket = {
    isFromIntegration: true,
    emit: (type, data) => {
      if (type == 'I_HAVE_A_REQUEST') {
        return this.onRequest(app.state.socket, data)
      }
      if (type == 'YOUR_REQUEST_HAS_RESPONSE') {
        return app.handleResponse(data)
      }
      if (type == 'I_HAVE_HANDLE_THIS_REQUEST') {
        return this.onResponse(app.state.socket, data)
      }
    }
  };
  this.integrations[integration.name] = app;
};

export {
  integrate
}