import http from 'http'
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import pick from 'lodash/pick'
import {getConfig} from './nedb'

const app = express();
let seashell = null;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/*+json'}));
app.use(bodyParser.json({type: 'text/html'}));
app.use(bodyParser.json({type: 'text/plain'}));

app.use(async (req, res, next) => {
  try {
    const __GATEWAY_META = Object.assign({},
      pick(req, ['ip', 'method', 'originalUrl', 'protocol']),
      pick(req.headers, ['user-agent', 'host'])
    );
    const data = Object.assign({}, req.query, req.body);
    const requestUrl = req.url;
    let result = {body: {}};
    if (requestUrl.search(seashell.__SEASHELL_NAME) === 0) {
      const originUrl = requestUrl.substring(seashell.__SEASHELL_NAME.length);
      let session = null;
      try {
        session = await seashell.requestSession({
          headers: {
            __GATEWAY_META,
            'switch-identity': {
              appName: 'user',
              appSecret: data.token
            }
          }
        });
      } catch (e) {}
      delete data.token;
      result = await seashell.requestSelf({
        headers: {__GATEWAY_META,originUrl,session},
        body: data
      })
    } else {
      result = await seashell.requestChild(requestUrl, data, {
        headers: {
          __GATEWAY_META,
          'switch-identity': {
            appName: 'user',
            appSecret: data.token
          }
        }
      });
    }

    if (result.body.error === 'TARGET_SERVICE_OFFLINE') res.status(404)
    res.json(result.body)
  } catch (e) {
    next(e)
  }
});

app.use((err, req, res, next) => {
  if (!err) return next()
  res.status(500);
  res.end(err.stack || err.message || err.name || err);
})

app.use((req, res) => {
  res.sendStatus(404)
})

const httpServer = http.createServer(app);
httpServer.start = (app) => process.nextTick(async() => {
  const config = await getConfig()
  seashell = app;
  httpServer.listen(config.port, () => {
    console.log(`[Seashell] http server listening on port ${config.port}`);
  })
})


export default httpServer;
