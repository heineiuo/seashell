'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash.defaults');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Base = function Base() {
  var _this = this;

  _classCallCheck(this, Base);

  this.setState = function (nextState) {
    _this.state = (0, _lodash2.default)(nextState, _this.state);
  };
};

exports.default = Base;