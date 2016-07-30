import Router from '../class/Router'

const router = new Router()

router.use((req, res, next) => {
  res.json = (body) => {
    res.body = body
    res.end()
  }
  next()
})

router.use('/service/create', require('./createService'))
router.use('/service/delete', require('./deleteService'))
router.use('/group/list', require('./groupList'))

router.use((err, req, res, next) => {
  if (typeof err == 'string') return res.json({error: err.toUpperCase()})
  res.json({error: 'EXCEPTION_ERROR'})
})

router.use((req, res) => {
  res.json({error: 'ROUTER_NOT_FOUND'})
})

export default router