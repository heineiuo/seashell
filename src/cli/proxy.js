const bodyParser  = require('body-parser');
const seashellProxy = require('../proxy');
const express  = require('express');
const morgan  = require('morgan');
const os  = require('os');
const path  = require('path');

module.exports = (target) => {

  const app = express();

  const serverModule = require(path.join(process.cwd(), target.entry));

  const server = serverModule.default || serverModule;

  app.use(morgan('dev', {}));
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Expose-Headers', '*');
    res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type');
    res.set('Access-Control-Allow-Methods', '*');
    next()
  });
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({type: 'application/*+json'}));
  app.use(bodyParser.json({type: 'text/html'}));
  app.use(bodyParser.json({type: 'text/plain'}));
  app.use(express.static(`${process.cwd()}/build/public`));
  app.use(target.publicPath, seashellProxy.seashellProxyMiddleware(server, target.seashell));

  /**
   * 错误处理
   */
  app.use((err, req, res, next) => {
    if (!err) return res.json({error: 'NOT_FOUND'});
    if (typeof err == 'string') return res.json({error: err});
    console.log(err);
    res.json({error: 'EXCEPTION_ERROR'})
  });

  app.listen(target.port, '127.0.0.1', (err) => {
    if (err) return console.log(err);
    console.log(`Listening at http://127.0.0.1:${target.port}`)
  });

};


