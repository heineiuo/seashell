var Datastore = require('nedb')

var Online = module.exports = new Datastore({
  filename: process.cwd()+'/data/db/Online.db',
  autoload: true
})