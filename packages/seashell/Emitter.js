'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var EventEmitter = require('events');
var util = require('util');

var Emitter = function Emitter() {
  EventEmitter.call(this);
};

util.inherits(Emitter, EventEmitter);

exports.default = Emitter;