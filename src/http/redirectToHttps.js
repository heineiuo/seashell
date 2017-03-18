import UAParser from 'ua-parser-js'

const redirectToHttpsMiddleware = (approvedDomains) => (req, res, next) => {
  try {
    if (approvedDomains.indexOf(req.headers.host) == -1 ) return next();
    if ( req.protocol == 'https' ) return next();
    const browser = new UAParser().setUA(req.headers['user-agent']).getBrowser();
    if (browser.name == 'IE' && Number(browser.major) < 9) return next();
    res.redirect(`https://${req.headers.host}${req.originalUrl}`)
  } catch(e){
    next(e)
  }

};

export {
  redirectToHttpsMiddleware
}