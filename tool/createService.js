var uuid = require('node-uuid')
var sha256 = require('sha.js')('sha256')
var fs = require('fs')

function createSha256(tobeHash){
  return sha256.update(tobeHash, 'uft-8').digest('hex')
}

function createService(){

  var service = {}
  service.appId = uuid.v4()
  service.appName = process.env.appName || ''
  service.appSecret = createSha256(Date.now()+Math.random())

  var data = JSON.stringify(service, null, 2)

  fs.writeFile('data/service/'+service.appId+'.json', data, 'UTF-8', console.log)

}

require('mkdirp').sync('data/service')
createService()

