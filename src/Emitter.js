const EventEmitter = require('events')
const util = require('util')

const Emitter = function(){
  EventEmitter.call(this)
}

util.inherits(Emitter, EventEmitter)

module.exports = Emitter