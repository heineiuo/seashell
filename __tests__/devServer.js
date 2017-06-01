import {App} from '../src/client'

const app = new App()

app.connect({url: 'http://127.0.0.1:3333?appName=test&appId=123&appSecret=123'})
