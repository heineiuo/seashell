import {App} from '../src/client'

const app = new App()

app.use(ctx => {
  ctx.response.body = {data: 123}
  ctx.response.end()
})

app.connect({url: 'http://127.0.0.1:3333?appName=test&appId=123&appSecret=123'})
