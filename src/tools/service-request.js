import Fetch from './fetch'

const config = require('./config')

const request = (urlstring, params) => new Promise(async (resolve, reject) => {
  try {
    const pathSplit = urlstring.split('/').filter(item => item !== '');
    const appName = pathSplit.shift()
    if (!config.serviceList[appName]) return reject(new Error('REQUEST_SERVICE_NOT_EXIST'))
    const path = pathSplit.join('/')
    const url = `${config.serviceList[appName]}/${path}`;
    console.log('requesting: ' + url);
    console.log('params: ' + params);
    const result = await new Fetch(url, params).post();
    resolve({body: result})

  } catch(e){
    reject(e)
  }
})

export {request}
export default request
