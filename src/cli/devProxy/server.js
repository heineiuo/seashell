import express from "express"
import morgan from "morgan"
import bodyParser from "body-parser"
import pick from "lodash/pick"

export default (seashell, opts={}) => {

  const app = express();
  const httpOptions = Object.assign({port: 8080}, opts);

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({type: 'application/*+json'}));
  app.use(bodyParser.json({type: 'text/html'}));
  app.use(bodyParser.json({type: 'text/plain'}));

  app.use(async (req, res, next) => {

    try {
      const meta = Object.assign({},
        pick(req, ['ip', 'method', 'originalUrl', 'protocol']),
        pick(req.headers, ['user-agent', 'host'])
      );

      const data = Object.assign({}, req.query, req.body);

      const result = await seashell.requestSelf({
          headers: {
            meta,
            originUrl: req.url
          },
          body: data
        })

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


  app.listen(httpOptions.port, () => {
    console.log('[SEASHELL] Seashell Proxy just for development, please consider your own proxy way on production')
    console.log('[SEASHELL] Seashell Proxy running on port ' + httpOptions.port)
  })

};

