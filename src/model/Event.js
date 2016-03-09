var Datastore = require('nedb')

var Event = module.exports = new Datastore({
  filename: process.cwd()+'/data/db/Event.db',
  autoload: true
})