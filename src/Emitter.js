const EventEmitter = require('events')
const util = require('util')

const MyEmitter = function(){
  EventEmitter.call(this)
}

util.inherits(MyEmitter, EventEmitter)

module.exports = MyEmitter