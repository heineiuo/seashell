var program = require('commander')
var uuid = require('node-uuid')
var sha256 = require('sha.js')('sha256')
var fs = require('fs-extra')
var path = require('path')
var version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'))).version
var createSecret = require('utils/secret')

program
  .version(version)
  .option('-v, --version', 'View version')
  .option('-k, --keygen [appName]', 'Create an auth file', appName)
  .option('-i, --init', 'Create an instance')
  .option('-p, --path', 'keygen path', targetPath)
  .option('-l, --list', 'List all services', listServices)
  .parse(process.argv)

module.exports = function () {

  if (program.keygen) createService(program)
  if (program.init) init(program)

}

function appName(val) {
  return val
}

function listServices(program) {

}

function targetPath(val) {
  return val
}



function createService(program, callback){
  console.log('Creating auth file...')
  var service = {}
  var targetPath = program.targetPath || process.cwd()
  service.appId = uuid.v4()
  service.appName = program.appName || 'unnamed'
  service.appSecret = createSecret()

  var data = JSON.stringify(service, null, 2)

  fs.writeFile(targetPath+'/'+service.appId+'.json', data, 'UTF-8', function (err) {
    if (err) console.error(err)
    console.log('Create auth file in path '+targetPath)
  })

}

