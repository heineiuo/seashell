const seashellProxyMiddleware = (seashellApp, seashellConfig) => {

  const handleRequest = (req, original) => {
    const {handleLoop} = seashellApp
    console.log(`[seashell] handle request: ${JSON.stringify(req)}`)
    Object.assign(req, {params: {}})
    const res = {
      headers: {
        appId: req.headers.appId,
        callbackId: req.headers.callbackId
      },
      body: {},
      end: () => {
        if (res.headers.__type === 'html') return original.res.end(res.body.__html)
        if (res.headers.__type === 'json') return original.res.json(res.body)
        original.res.json(res.body)
      },
      json: (data) => {
        res.headers.__type = 'json'
        res.body = data
        res.end()
      },
      render: (string) => {
        res.headers.__type = 'html'
        res.body.__html = string
        res.end()
      }
    }
    const next = (err, req, res, index, pathname) => {
      return handleLoop(err, req, res, next, index, pathname)
    }
    next(null, req, res, 0, req.headers.originUrl)
  }

  if (typeof seashellConfig !== 'undefined') {
    seashellApp.connect(seashellConfig)
  }

  return (req, res, next) => {
    const original = {
      req: req,
      res: res,
      next: next
    }
    const seaReq = {
      headers: {
        originUrl: req.path
      },
      body: Object.assign({}, req.query, req.body)
    }
    handleRequest(seaReq, original)
  }
}

export { seashellProxyMiddleware }
