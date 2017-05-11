export default {
  socket: {
    query: require('./queryOne').default,
    bind: require('./bind').default,
    unbind: require('./unbind').default,
    session: require('./session').default,
  }
};

