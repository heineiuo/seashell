const createIndex = () => {
  return `
import App from 'seashell/lib/client

const app = new App()
  `
}

const createPackage = () => {
  return `
{
  "name": "seashell-instance",
  "private": true,
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "seashell": "~0.4.7"
  }
}
  `
}

const createConfig = () => {
  return {
    "targets": [
      {
        "entry": "server/index.js",
        "publicPath": "/",
        "outputPath": "build/bin",
        "outputName": "example",
        "seashellUrl": "ws://SEASHELL_HOST/?appId=APPID&appName=APP_NAME&appSecret=APP_SECRET"
      }
    ]
  }
}

export default () => {
  console.log('[SEASHELL] Start init...')
}
