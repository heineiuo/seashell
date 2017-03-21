const onResponse = function (res) {
  const {importEmitterStack} = this.state;
  const {callbackId} = res.headers;
  importEmitterStack[callbackId].emit('RESPONSE', res);
  delete importEmitterStack[callbackId];
  this.state.importEmitterStack = importEmitterStack
};

export {
  onResponse
}