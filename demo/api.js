const app = require('express')()
const http = require('http').Server(app)

import {App} from '../src'

const seashellMiddleware = (conf)=>{
  const seashell = new App()
  seashell.connect(conf.seashell)
  return (req, res, next) => {
    res.locals.seashell = seashell
    next()
  }
}


app.use(seashellMiddleware({
  "seashell": {
    "url": 'ws://127.0.0.1:3311',
    "key": {
      "appId": "01b257a9-08af-475d-a686-e8eab6026c1c",
      "appName": "api",
      "appSecret": "da5698be17b9b46962335799779fbeca8ce5d491c0d26243bafef9ea1837a9d8"
    }
  }
}))

app.use('/api', async (req, res, next) => {

  console.log('/api')
  const {seashell} = res.locals
  try {
    const example = {
      foo: "bar"
    }
    var time = [Date.now()]
    const response = await seashell.request('/account/example', example)
    time.push(Date.now())
    response.body.timeused = `${time[1] - time[0]}ms`
    res.json(response)
  } catch(e) {
    res.end(JSON.stringify(e))
  }
})

http.listen(3001, function () {
  console.log('listing on port 3001')
})

