import httpProxy from 'http-proxy'

/**
 * 反向代理
 */
const httpProxyMiddleware = (app) => {

  const proxy = httpProxy.createProxyServer({
    // protocolRewrite: 'http'
  });

  proxy.on('error', (err, req, res) => {
    res.next(err)
  });

  proxy.on('proxyRes', (proxyRes, req, res) => {
    Object.keys(proxyRes.headers).forEach(key => {
      res.set(key, proxyRes.headers[key])
    })
  });


  // app.on('upgrade', (req, socket, head) => {
  //   console.log('========upgrade==========');
  //   proxy.ws(req, socket, head);
  // });

  return (req, res, next) => {

    try {
      const {location} = res.locals;

      if (location.type != 'PROXY') return next();

      // todo handle ssl cert to options
      proxy.web(req, res, {
        target: location.content
      });


    } catch(e){
      next(e)
    }

  };
};

export {
  httpProxyMiddleware
}