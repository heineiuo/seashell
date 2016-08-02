import Router from '../class/Router'

const router = new Router()

/**
 * add `res.json` method
 */
router.use((req, res, next) => {
  res.json = (body) => {
    res.body = body
    res.end()
  }
  res.error = (errCode) => {
    res.json({error: errCode})
  }
  next()
})

/**
 * router list
 */
router.use('/service/create', require('./service/create'))
router.use('/service/delete', require('./service/delete'))
router.use('/service/enable', require('./service/enable'))
router.use('/service/disable', require('./service/disable'))
router.use('/service/list', require('./service/list'))
router.use('/group/list', require('./group/list'))

/**
 * error handle
 */
router.use((err, req, res, next) => {
  if (typeof err == 'string') return res.error(err.toUpperCase())
  res.error('EXCEPTION_ERROR')
})

/**
 * 404 handle
 */
router.use((req, res) => {
  res.error('ROUTER_NOT_FOUND')
})

export default router