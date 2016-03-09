var Datastore = require('nedb')

var Service = module.exports = new Datastore({
  filename: process.cwd()+'/data/db/Service.db',
  autoload: true
})