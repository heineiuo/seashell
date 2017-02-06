import { App, Router } from '../../packages/seashell-client-node/src/index'
const app = new App()
const router = new Router()
const router2 = new Router()


router.use('/a', (req, res, next) => {
  res.body = {
    username: "哈哈"
  }
  res.end()
})

router.use('/b', (req, res, next) => {
  res.body = {
    username: "bbbbb"
  }
  res.end()
})

router2.use('/example', router)

app.use('/api', router2)

app.connect({
  "url": 'ws://127.0.0.1:3311',
  "key": {
    "appId": "285fb8f6-046f-403f-807f-344c8722741d",
    "appName": "account",
    "appSecret": "da5698be17b9b46962335799779fbeca8ce5d491c0d26243bafef9ea1837a9d8"
  }
})

