import handleHTML from "./html"
import handleBLOCK from "./block"
import handleFILE from "./file"
import handleREDIRECT from "./redirect"
import handleDOWNLOAD from "./download"
import handleUPLOAD from "./upload"
import {Router} from "express"

const handler = () => {
  const router = Router();

  router.use(async(req, res, next) => {

    try {

      const {host, url, location, location: {type, content}} = res.locals;
      const handles = {
        JSON: () => new Promise((resolve, reject) => {
          try {
            res.json(location.content);
            resolve()
          } catch (e) {
            reject(e)
          }
        }),
        HTML: () => handleHTML(res, content),
        BLOCK: () => handleBLOCK(res, content),
        FILE: () => handleFILE(res, host, url.pathname, req.path),
        REDIRECT: () => handleREDIRECT(res, content),
        DOWNLOAD: () => handleDOWNLOAD(res, req.query.path),
        UPLOAD: () => handleUPLOAD(req, res, content),
      };

      if (handles.hasOwnProperty(type)) return await handles[type]();

      /**
       * 未定义的type类型
       */
      next(new Error('ILLEGAL_HTTP_REQUEST'))

    } catch (e) {
      next(e)
    }

  });

  router.use((err, req, res, next) => {
    if (err.message == 'USE_PROXY') return next();
    next(err)
  });

  return router;
};

export {
  handler
}
