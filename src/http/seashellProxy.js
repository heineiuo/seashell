import {Router} from 'express'
import bodyParser from 'body-parser'
import pick from 'lodash.pick'

const JSONSafeParse = (content, schema) => {
  try {
    return JSON.parse(content)
  } catch(e){
    return Object.assign({}, schema, {
      JSONSafeParseError: e
    })
  }
};

const seashellProxyMiddleware = () => {

  const router = Router();

  router.use((req, res, next) => {
    const {location} = res.locals;
    if (location.type == 'SEASHELL') return next();
    return next(new Error('NOT_SEASHELL'))
  });

  router.use(bodyParser.urlencoded({extended: true}));
  router.use(bodyParser.json());
  router.use(bodyParser.json({type: 'application/*+json'}));
  router.use(bodyParser.json({type: 'text/html'}));
  router.use(bodyParser.json({type: 'text/plain'}));

  router.use(async (req, res, next) => {

    try {
      const {gateway} = res;
      const {host, url, location} = res.locals;

      const data = Object.assign({}, req.query, req.body, {
        __GATEWAY_META: Object.assign(
          {},
          pick(req, ['ip', 'method', 'originalUrl', 'protocol']),
          pick(req.headers, ['user-agent', 'host'])
        )
      });

      // console.log(data);

      const requestSession = await gateway.request('account', Object.assign(data));

      Object.assign(data, {__GATEWAY_USER: requestSession.body});

      // const importAppName = location.content.search('{') != 0 ? location.content:
      //   url.pathname.search('account') > 0 ?'account':'gateway';
      const result = await gateway.request(data.importAppName, data);

      // console.log('==============seashell result =============');
      // console.log(result);

      if (result.headers.hasOwnProperty('__HTML')) {
        Object.assign(res.locals.location, {type: 'HTML', content: result.body.html})
      } else if (result.headers.hasOwnProperty('__UPLOAD')) {
        Object.assign(res.locals.location, {type: 'UPLOAD', content: result.body})
      } else {
        Object.assign(res.locals.location, {type: 'JSON', content: result.body})
      }

      // console.log(res.locals.location);

      next()

    } catch(e){
      if (process.env.NODE_ENV == 'development') console.log(e.stack||e);
      next(e)
    }

  });

  router.use((err, req, res, next) => {
    if (!err) return next();
    if (err.message == 'NOT_SEASHELL') return next();
    if (process.env.NODE_ENV == 'development') console.log(err.stack||err);
    next(err)
  });

  return router

};


export {
  seashellProxyMiddleware
}