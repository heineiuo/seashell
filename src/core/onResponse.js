
const onResponse = function (res) {
  const {callbackId} = res.headers;
  this.importEmitterStack[callbackId].emit('RESPONSE', res);
};

export {
  onResponse
}
