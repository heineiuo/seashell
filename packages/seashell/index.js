'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uuid = exports.pathMatch = exports.splitUrl = exports.Router = exports.App = undefined;

var _client = require('./client');

Object.defineProperty(exports, 'App', {
  enumerable: true,
  get: function get() {
    return _client.App;
  }
});
Object.defineProperty(exports, 'Router', {
  enumerable: true,
  get: function get() {
    return _client.Router;
  }
});
Object.defineProperty(exports, 'splitUrl', {
  enumerable: true,
  get: function get() {
    return _client.splitUrl;
  }
});
Object.defineProperty(exports, 'pathMatch', {
  enumerable: true,
  get: function get() {
    return _client.pathMatch;
  }
});
Object.defineProperty(exports, 'uuid', {
  enumerable: true,
  get: function get() {
    return _client.uuid;
  }
});

var _Seashell = require('./core/Seashell');

var _Seashell2 = _interopRequireDefault(_Seashell);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Seashell2.default;