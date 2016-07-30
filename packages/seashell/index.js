module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Router = exports.App = exports.Hub = undefined;

	var _Hub2 = __webpack_require__(2);

	var _Hub3 = _interopRequireDefault(_Hub2);

	var _App2 = __webpack_require__(29);

	var _App3 = _interopRequireDefault(_App2);

	var _Router2 = __webpack_require__(14);

	var _Router3 = _interopRequireDefault(_Router2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.Hub = _Hub3.default;
	exports.App = _App3.default;
	exports.Router = _Router3.default;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _stringify = __webpack_require__(3);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _getPrototypeOf = __webpack_require__(6);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _possibleConstructorReturn2 = __webpack_require__(8);

	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

	var _inherits2 = __webpack_require__(9);

	var _inherits3 = _interopRequireDefault(_inherits2);

	var _socket = __webpack_require__(10);

	var _socket2 = _interopRequireDefault(_socket);

	var _Base2 = __webpack_require__(11);

	var _Base3 = _interopRequireDefault(_Base2);

	var _admin = __webpack_require__(13);

	var _admin2 = _interopRequireDefault(_admin);

	var _config = __webpack_require__(27);

	var _config2 = _interopRequireDefault(_config);

	var _db = __webpack_require__(17);

	var Service = _interopRequireWildcard(_db);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Hub = function (_Base) {
	  (0, _inherits3.default)(Hub, _Base);

	  function Hub() {
	    var _Object$getPrototypeO,
	        _this2 = this;

	    var _temp, _this, _ret;

	    (0, _classCallCheck3.default)(this, Hub);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_Object$getPrototypeO = (0, _getPrototypeOf2.default)(Hub)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {}, _this.handleRequest = function () {
	      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(socket, req) {
	        var io, importAppName, reqService, resService, res;
	        return _regenerator2.default.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                io = _this.state.io;
	                _context.prev = 1;

	                if (req.headers.callbackId) {
	                  _context.next = 4;
	                  break;
	                }

	                throw new Error('LOST_CALLBACK_ID');

	              case 4:
	                req.headers.__SEASHELL_START = Date.now();

	                importAppName = req.headers.importAppName;
	                /**
	                 * 验证请求是否合法
	                 */

	                _context.next = 8;
	                return Service.getAppBySocketId(socket.id);

	              case 8:
	                reqService = _context.sent;

	                if (reqService) {
	                  _context.next = 11;
	                  break;
	                }

	                throw 'PERMISSION_DENIED';

	              case 11:
	                _context.next = 13;
	                return Service.getResSocketWithBalance(importAppName);

	              case 13:
	                resService = _context.sent;

	                if (resService) {
	                  _context.next = 16;
	                  break;
	                }

	                throw "TARGET_SERVICE_OFFLINE";

	              case 16:

	                console.log('[seashell] ' + reqService + ' --> ' + req.headers.originUrl);

	                /**
	                 * 如果请求的是admin, 则直接调用admin接口
	                 */

	                if (!(importAppName == 'admin')) {
	                  _context.next = 19;
	                  break;
	                }

	                return _context.abrupt('return', _this.handleAdminRequest(socket, req));

	              case 19:
	                /**
	                 * 发包给目标app
	                 */
	                io.sockets.connected[resService.socketId].emit('PLEASE_HANDLE_THIS_REQUEST', req);

	                _context.next = 28;
	                break;

	              case 22:
	                _context.prev = 22;
	                _context.t0 = _context['catch'](1);

	                console.log(_context.t0);
	                res = {
	                  headers: {
	                    callbackId: req.headers.callbackId
	                  },
	                  body: {
	                    error: typeof _context.t0 == 'string' ? _context.t0 : 'HUB_EXCEPTION_ERROR'
	                  }
	                };

	                socket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
	                console.log('[seashell] request failed because ' + req.body.error);

	              case 28:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, _this2, [[1, 22]]);
	      }));

	      return function (_x, _x2) {
	        return _ref.apply(this, arguments);
	      };
	    }(), _this.handleAdminRequest = function () {
	      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(reqSocket, req) {
	        var handleLoop, res, next;
	        return _regenerator2.default.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                handleLoop = _admin2.default.handleLoop;

	                console.log('[seashell] handle admin request: ' + (0, _stringify2.default)(req));
	                res = {
	                  headers: {
	                    appId: req.headers.appId,
	                    callbackId: req.headers.callbackId
	                  },
	                  body: {},
	                  end: function end() {
	                    reqSocket.emit('YOUR_REQUEST_HAS_RESPONSE', {
	                      headers: res.headers,
	                      body: res.body
	                    });
	                  }
	                };

	                next = function next(err, req, res, index, pathname) {
	                  return handleLoop(err, req, res, next, index, pathname);
	                };

	                next(null, req, res, 0, req.headers.originUrl);

	              case 5:
	              case 'end':
	                return _context2.stop();
	            }
	          }
	        }, _callee2, _this2);
	      }));

	      return function (_x3, _x4) {
	        return _ref2.apply(this, arguments);
	      };
	    }(), _this.handleResponse = function () {
	      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(socket, res) {
	        var io, reqSocket;
	        return _regenerator2.default.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                io = _this.state.io;
	                _context3.prev = 1;

	                if (res.headers.appId) {
	                  _context3.next = 4;
	                  break;
	                }

	                throw new Error('Export Lost Params: [appId]');

	              case 4:
	                if (res.headers.callbackId) {
	                  _context3.next = 6;
	                  break;
	                }

	                throw new Error('Export Lost Params: [callbackId]');

	              case 6:
	                _context3.next = 8;
	                return Service.getSocketByAppId(res.headers.appId);

	              case 8:
	                reqSocket = _context3.sent;

	                io.sockets.connected[reqSocket.socketId].emit('YOUR_REQUEST_HAS_RESPONSE', res);
	                console.log('[seashell] ' + reqSocket.appName + ' <-- ' + res.headers.originUrl + ',' + (' total spend ' + (Date.now() - res.headers.__SEASHELL_START) + 'ms'));

	                _context3.next = 18;
	                break;

	              case 13:
	                _context3.prev = 13;
	                _context3.t0 = _context3['catch'](1);

	                if (!(_context3.t0 == 'REQUEST_SOCKET_OFFLINE')) {
	                  _context3.next = 17;
	                  break;
	                }

	                return _context3.abrupt('return', console.log('[seashell] reqSocket offline'));

	              case 17:
	                console.error(_context3.t0);

	              case 18:
	              case 'end':
	                return _context3.stop();
	            }
	          }
	        }, _callee3, _this2, [[1, 13]]);
	      }));

	      return function (_x5, _x6) {
	        return _ref3.apply(this, arguments);
	      };
	    }(), _this.handleRegister = function () {
	      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(socket, data) {
	        var insertData, socketData, error;
	        return _regenerator2.default.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.prev = 0;

	                if (socket.id) {
	                  _context4.next = 3;
	                  break;
	                }

	                throw 'LOST_SOCKET_ID';

	              case 3:
	                insertData = {
	                  appName: data.appName,
	                  appId: data.appId,
	                  appSecret: data.appSecret
	                };
	                _context4.next = 6;
	                return Service.bindAppToSocket(socket.id, insertData);

	              case 6:
	                socketData = _context4.sent;

	                console.log('[seashell] register success, data: ' + data);
	                socket.emit('YOUR_REGISTER_HAS_RESPONSE', { success: 1, socketData: socketData });
	                _context4.next = 16;
	                break;

	              case 11:
	                _context4.prev = 11;
	                _context4.t0 = _context4['catch'](0);

	                console.log('[seashell] register failed, data: ' + data);
	                error = typeof _context4.t0 == 'string' ? _context4.t0 : 'EXCEPTION_ERROR';

	                socket.emit('YOUR_REGISTER_HAS_RESPONSE', { error: error });

	              case 16:
	              case 'end':
	                return _context4.stop();
	            }
	          }
	        }, _callee4, _this2, [[0, 11]]);
	      }));

	      return function (_x7, _x8) {
	        return _ref4.apply(this, arguments);
	      };
	    }(), _this.start = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
	      var Hub, io;
	      return _regenerator2.default.wrap(function _callee6$(_context6) {
	        while (1) {
	          switch (_context6.prev = _context6.next) {
	            case 0:
	              if (!_this.state.isStarted) {
	                _context6.next = 2;
	                break;
	              }

	              return _context6.abrupt('return', false);

	            case 2:
	              Hub = _this;
	              _context6.prev = 3;


	              /**
	               * Create a socket instance
	               */
	              io = (0, _socket2.default)();

	              Hub.setState({ io: io });

	              /**
	               * empty old registered services
	               */
	              _context6.next = 8;
	              return Service.emptySocket();

	            case 8:

	              /**
	               * handle socket connection
	               */
	              io.on('connection', function (socket) {
	                console.log('[seashell] new connection ' + socket.id);
	                socket.on('REGISTER', function (data) {
	                  Hub.handleRegister(socket, data);
	                });
	                socket.on('I_HAVE_A_REQUEST', function (request) {
	                  Hub.handleRequest(socket, request);
	                });
	                socket.on('I_HAVE_HANDLE_THIS_REQUEST', function (response) {
	                  Hub.handleResponse(socket, response);
	                });

	                /**
	                 * handle disconnect
	                 */
	                socket.on('disconnect', function () {
	                  var deleteSocket = function () {
	                    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(socketId) {
	                      var retry = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	                      return _regenerator2.default.wrap(function _callee5$(_context5) {
	                        while (1) {
	                          switch (_context5.prev = _context5.next) {
	                            case 0:
	                              _context5.prev = 0;

	                              console.log('[seashell] ' + socketId + ' disconnected');
	                              _context5.next = 4;
	                              return Service.deleteSocket(socketId);

	                            case 4:
	                              _context5.next = 9;
	                              break;

	                            case 6:
	                              _context5.prev = 6;
	                              _context5.t0 = _context5['catch'](0);

	                              if (retry < 3) {
	                                retry++;
	                                deleteSocket(retry);
	                              }

	                            case 9:
	                            case 'end':
	                              return _context5.stop();
	                          }
	                        }
	                      }, _callee5, _this2, [[0, 6]]);
	                    }));

	                    return function deleteSocket(_x9, _x10) {
	                      return _ref6.apply(this, arguments);
	                    };
	                  }();
	                  deleteSocket(socket.id);
	                });
	              });

	              /**
	               * listing on a port
	               */
	              console.log('listening on port ' + _config2.default.port);
	              io.listen(_config2.default.port);

	              _context6.next = 17;
	              break;

	            case 13:
	              _context6.prev = 13;
	              _context6.t0 = _context6['catch'](3);

	              console.log(_context6.t0.stack || _context6.t0);
	              throw _context6.t0;

	            case 17:
	            case 'end':
	              return _context6.stop();
	          }
	        }
	      }, _callee6, _this2, [[3, 13]]);
	    })), _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
	  }

	  /**
	   * receive request from a service
	   * 1. get request data
	   * 2. validate service permission
	   * 3. pipe request to target service
	   */


	  /**
	   * 处理admin操作的请求
	   * @param reqSocket
	   * @param req
	   */


	  /**
	   * handle `callback`
	   * @return response.appId `response header's service id`
	   * @return response.callbackId `callbackId`
	   * @return response.data `response body`
	   */


	  /**
	   * register service
	   * @param socket
	   * @param data
	   * @returns {Emitter|Namespace|Socket|*}
	   */


	  /****************
	   *
	   * INIT Service
	   *
	   **************/


	  return Hub;
	}(_Base3.default);

	exports.default = Hub;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/json/stringify");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/regenerator");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/get-prototype-of");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/classCallCheck");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/possibleConstructorReturn");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/inherits");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _lodash = __webpack_require__(12);

	var _lodash2 = _interopRequireDefault(_lodash);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Base = function Base() {
	  var _this = this;

	  (0, _classCallCheck3.default)(this, Base);

	  this.setState = function (nextState) {
	    _this.state = (0, _lodash2.default)(nextState, _this.state);
	  };
	};

	exports.default = Base;
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("lodash.defaults");

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Router = __webpack_require__(14);

	var _Router2 = _interopRequireDefault(_Router);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var router = new _Router2.default();

	router.use(function (req, res, next) {
	  res.json = function (body) {
	    res.body = body;
	    res.end();
	  };
	  next();
	});

	router.use('/service/create', __webpack_require__(16));
	router.use('/service/delete', __webpack_require__(25));
	router.use('/group/list', __webpack_require__(26));

	router.use(function (err, req, res, next) {
	  if (typeof err == 'string') return res.json({ error: err.toUpperCase() });
	  res.json({ error: 'EXCEPTION_ERROR' });
	});

	router.use(function (req, res) {
	  res.json({ error: 'ROUTER_NOT_FOUND' });
	});

	exports.default = router;
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _getPrototypeOf = __webpack_require__(6);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _possibleConstructorReturn2 = __webpack_require__(8);

	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

	var _inherits2 = __webpack_require__(9);

	var _inherits3 = _interopRequireDefault(_inherits2);

	var _Base2 = __webpack_require__(11);

	var _Base3 = _interopRequireDefault(_Base2);

	var _errHandleChecker = __webpack_require__(15);

	var _errHandleChecker2 = _interopRequireDefault(_errHandleChecker);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Router = function (_Base) {
	  (0, _inherits3.default)(Router, _Base);

	  function Router() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    (0, _classCallCheck3.default)(this, Router);
	    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_Object$getPrototypeO = (0, _getPrototypeOf2.default)(Router)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.exportActionStack = [], _this.use = function () {
	      var pathname, middleware;
	      if (arguments.length == 1) {
	        pathname = '';
	        middleware = arguments[0];
	      } else {
	        pathname = arguments[0];
	        middleware = arguments[1];
	      }

	      var exportActionStack = this.exportActionStack;

	      var item = {
	        path: pathname,
	        isErrorHandle: false
	      };
	      if (middleware instanceof Function) {
	        item.isErrorHandle = (0, _errHandleChecker2.default)(middleware);
	        item.fn = middleware;
	      } else {
	        item.router = middleware;
	      }
	      exportActionStack.push(item);
	    }, _this.handleLoop = function (err, req, res, _next, _index, _pathname) {
	      var _this2 = _this;
	      var exportActionStack = _this2.exportActionStack;

	      /**
	       * 开始执行
	       */

	      var index = -1;
	      next(err);

	      /**
	       * 流程控制
	       */
	      function next(err) {

	        /**
	         * 中间件执行
	         * @param type 中间件类型
	         * @param middleware
	         */

	        var run = function () {
	          var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(type, middleware) {
	            var nextPathname;
	            return _regenerator2.default.wrap(function _callee$(_context) {
	              while (1) {
	                switch (_context.prev = _context.next) {
	                  case 0:
	                    _context.prev = 0;

	                    if (!(type == 'error')) {
	                      _context.next = 3;
	                      break;
	                    }

	                    return _context.abrupt('return', middleware.fn(err, req, res, next));

	                  case 3:
	                    if (!(type == 'router')) {
	                      _context.next = 6;
	                      break;
	                    }

	                    nextPathname = _pathname.substr(middleware.path.length);
	                    return _context.abrupt('return', middleware.router.handleLoop(err, req, res, next, index, nextPathname));

	                  case 6:
	                    _context.next = 8;
	                    return middleware.fn(req, res, next);

	                  case 8:
	                    return _context.abrupt('return', _context.sent);

	                  case 11:
	                    _context.prev = 11;
	                    _context.t0 = _context['catch'](0);

	                    // console.log(`[seashell] catch error: ${e.stack||e}`)
	                    next(_context.t0);

	                  case 14:
	                  case 'end':
	                    return _context.stop();
	                }
	              }
	            }, _callee, this, [[0, 11]]);
	          }));

	          return function run(_x, _x2) {
	            return _ref.apply(this, arguments);
	          };
	        }();

	        index++;

	        /**
	         * 检查指针
	         * 流程结束, 收尾
	         * 错误检查
	         * 404 检查
	         */
	        if (index >= exportActionStack.length) {
	          // if (err) console.log(`[seashell] unhandled error: ${err.stack||err}`)
	          return _next(err, req, res, _next, _index);
	        }

	        var middleware = exportActionStack[index];

	        /**
	         * 错误处理中间件
	         * 检查是否有错误要处理
	         * 有错误: 跳过普通中间件, 找到错误处理中间件处理错误
	         * 没错误: 跳过错误中间件
	         */
	        if (middleware.isErrorHandle) {
	          if (err) return run('error', middleware);
	          return next();
	        }
	        if (err) return next(err);

	        /**
	         * 路由中间件
	         */
	        if (middleware.router) return run('router', middleware);

	        /**
	         * 普通中间件
	         * 不匹配: 直接next
	         * 匹配: run()
	         */
	        if (typeof middleware.path != 'undefined') {
	          if (middleware.path != '' && _pathname != middleware.path) return next();
	          run(null, middleware);
	        }
	      }
	    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
	  }

	  /**
	   * use
	   */


	  return Router;
	}(_Base3.default);

	exports.default = Router;
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * 错误处理中间件判断
	 * @param fn
	 * @returns {boolean}
	 */

	var errHandleChecker = function errHandleChecker(fn) {
	  try {
	    return fn.toString().match(/[A-Z0-9a-z,(\s]*\)/)[0].split(',').length == 4;
	  } catch (e) {
	    return false;
	  }
	};

	exports.default = errHandleChecker;
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _db = __webpack_require__(17);

	var db = _interopRequireWildcard(_db);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = function () {
	  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next) {
	    var newService;
	    return _regenerator2.default.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _context.next = 2;
	            return db.createService(req.body.serviceName);

	          case 2:
	            newService = _context.sent;

	            res.json({ service: newService });

	          case 4:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, undefined);
	  }));

	  return function (_x, _x2, _x3) {
	    return _ref.apply(this, arguments);
	  };
	}();

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.createService = exports.getResSocketWithBalance = exports.bindAppToSocket = exports.getSocketByAppId = exports.getAppBySocketId = exports.deleteSocket = exports.emptySocket = undefined;

	var _assign = __webpack_require__(18);

	var _assign2 = _interopRequireDefault(_assign);

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _promise = __webpack_require__(19);

	var _promise2 = _interopRequireDefault(_promise);

	var _uuid = __webpack_require__(20);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _createSecret = __webpack_require__(21);

	var _createSecret2 = _interopRequireDefault(_createSecret);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var db = __webpack_require__(23)(__webpack_require__(24)('./data/db/service'));

	/**
	 * group_list: ['account', 'file']
	 * group_file [{appId: 'fdada', socketId, status: 'adfad'}, {...}]
	 * socket_jkfdlahgklh23hkhfahdf: {
	 *  appId: 'aaa',
	 *  appName: 'account',
	 *  permission: ['admin'],
	 *  socketId: 'ccc'
	 * }
	 */
	var emptySocket = exports.emptySocket = function emptySocket() {
	  return new _promise2.default(function () {
	    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
	      var list, allAppMetaGroup, allAppMeta, allSocketIds;
	      return _regenerator2.default.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              _context.prev = 0;
	              _context.next = 3;
	              return db.get('group_list', { valueEncoding: 'json' });

	            case 3:
	              list = _context.sent;
	              _context.next = 6;
	              return _promise2.default.all(list.map(function (group) {
	                db.get('group_' + group, { valueEncoding: 'json' });
	              }));

	            case 6:
	              allAppMetaGroup = _context.sent;
	              allAppMeta = allAppMetaGroup.reduce(function (previous, current) {
	                return previous.concat(current);
	              }, []);
	              allSocketIds = allAppMeta.map(function (app) {
	                return app.socketId;
	              }).filter(function (val) {
	                return typeof val == 'string';
	              });
	              _context.next = 11;
	              return _promise2.default.all(allSocketIds.forEach(function (socketId) {
	                return db.del('socket_' + socketId);
	              }));

	            case 11:
	              _context.next = 19;
	              break;

	            case 13:
	              _context.prev = 13;
	              _context.t0 = _context['catch'](0);

	              if (!(typeof _context.t0 == 'string')) {
	                _context.next = 17;
	                break;
	              }

	              return _context.abrupt('return', reject(_context.t0));

	            case 17:
	              console.log(_context.t0);
	              reject('EMPTY_SOCKET_FAIL');

	            case 19:
	            case 'end':
	              return _context.stop();
	          }
	        }
	      }, _callee, undefined, [[0, 13]]);
	    }));

	    return function (_x, _x2) {
	      return _ref.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * delete socket
	 */
	var deleteSocket = exports.deleteSocket = function deleteSocket(socketId) {
	  return new _promise2.default(function () {
	    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(resolve, reject) {
	      var removed;
	      return _regenerator2.default.wrap(function _callee2$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              _context2.prev = 0;
	              _context2.next = 3;
	              return db.del('socket_' + socketId);

	            case 3:
	              removed = _context2.sent;
	              _context2.next = 9;
	              break;

	            case 6:
	              _context2.prev = 6;
	              _context2.t0 = _context2['catch'](0);

	              reject(_context2.t0);

	            case 9:
	            case 'end':
	              return _context2.stop();
	          }
	        }
	      }, _callee2, undefined, [[0, 6]]);
	    }));

	    return function (_x3, _x4) {
	      return _ref2.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * 根据socketId获取app信息
	 * @param socketId
	 * @returns {Promise}
	 */
	var getAppBySocketId = exports.getAppBySocketId = function getAppBySocketId(socketId) {
	  return new _promise2.default(function () {
	    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(resolve, reject) {
	      var socket;
	      return _regenerator2.default.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              _context3.prev = 0;
	              _context3.next = 3;
	              return db.get('socket_' + socketId, { valueEncoding: 'json' });

	            case 3:
	              socket = _context3.sent;

	              resolve(socket);
	              _context3.next = 13;
	              break;

	            case 7:
	              _context3.prev = 7;
	              _context3.t0 = _context3['catch'](0);

	              if (!(typeof _context3.t0 == 'string')) {
	                _context3.next = 11;
	                break;
	              }

	              return _context3.abrupt('return', reject(_context3.t0));

	            case 11:
	              console.log(_context3.t0);
	              reject('NOT_FOUND');

	            case 13:
	            case 'end':
	              return _context3.stop();
	          }
	        }
	      }, _callee3, undefined, [[0, 7]]);
	    }));

	    return function (_x5, _x6) {
	      return _ref3.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * getSocketByAppId
	 * @param appId
	 * @returns {Promise}
	 */
	var getSocketByAppId = exports.getSocketByAppId = function getSocketByAppId(appId) {
	  return new _promise2.default(function () {
	    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(resolve, reject) {
	      var app, group, targetAppIndex, socket;
	      return _regenerator2.default.wrap(function _callee4$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              _context4.prev = 0;
	              _context4.next = 3;
	              return db.get('service_' + appId);

	            case 3:
	              app = _context4.sent;
	              _context4.next = 6;
	              return db.get('group_' + app.appName);

	            case 6:
	              group = _context4.sent;
	              targetAppIndex = group.findIndex(function (item) {
	                return item.appId == appId;
	              });

	              if (!(targetAppIndex < 0)) {
	                _context4.next = 10;
	                break;
	              }

	              throw 'APP_NOT_FOUND';

	            case 10:
	              _context4.next = 12;
	              return db.get('socket_' + group[targetAppIndex].socketId);

	            case 12:
	              socket = _context4.sent;

	              resolve(socket);
	              _context4.next = 19;
	              break;

	            case 16:
	              _context4.prev = 16;
	              _context4.t0 = _context4['catch'](0);

	              reject(_context4.t0);

	            case 19:
	            case 'end':
	              return _context4.stop();
	          }
	        }
	      }, _callee4, undefined, [[0, 16]]);
	    }));

	    return function (_x7, _x8) {
	      return _ref4.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * 绑定app到socket
	 * @param socketId
	 * @param registerInfo
	 * @returns {Promise}
	 */
	var bindAppToSocket = exports.bindAppToSocket = function bindAppToSocket(socketId, registerInfo) {
	  return new _promise2.default(function () {
	    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(resolve, reject) {
	      var app, socketData;
	      return _regenerator2.default.wrap(function _callee5$(_context5) {
	        while (1) {
	          switch (_context5.prev = _context5.next) {
	            case 0:
	              _context5.prev = 0;
	              _context5.next = 3;
	              return db.get('service_' + registerInfo.appId);

	            case 3:
	              app = _context5.sent;

	              if (!(app.appSecret != registerInfo.appSecret)) {
	                _context5.next = 6;
	                break;
	              }

	              throw 'ERROR_REGISTER_INFO';

	            case 6:
	              socketData = (0, _assign2.default)({}, app, { socketId: socketId });
	              _context5.next = 9;
	              return db.put('socket_' + socketId, socketData, { valueEncoding: 'json' });

	            case 9:
	              resolve(socketData);
	              _context5.next = 18;
	              break;

	            case 12:
	              _context5.prev = 12;
	              _context5.t0 = _context5['catch'](0);

	              if (!(typeof _context5.t0 == 'string')) {
	                _context5.next = 16;
	                break;
	              }

	              return _context5.abrupt('return', reject(_context5.t0));

	            case 16:
	              console.log(_context5.t0);
	              reject('REGISTER_FAIL');

	            case 18:
	            case 'end':
	              return _context5.stop();
	          }
	        }
	      }, _callee5, undefined, [[0, 12]]);
	    }));

	    return function (_x9, _x10) {
	      return _ref5.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * 获取处理请求的app, 并作负载均衡
	 */
	var getResSocketWithBalance = exports.getResSocketWithBalance = function getResSocketWithBalance(importAppName) {
	  return new _promise2.default(function () {
	    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(resolve, reject) {
	      var group;
	      return _regenerator2.default.wrap(function _callee6$(_context6) {
	        while (1) {
	          switch (_context6.prev = _context6.next) {
	            case 0:
	              _context6.prev = 0;
	              _context6.next = 3;
	              return db.get('group_' + importAppName, { valueEncoding: 'json' });

	            case 3:
	              group = _context6.sent;

	              if (!(group.length == 0)) {
	                _context6.next = 6;
	                break;
	              }

	              throw 'TARGET_SERVICE_OFFLINE';

	            case 6:
	              if (!(group.length == 1)) {
	                _context6.next = 8;
	                break;
	              }

	              return _context6.abrupt('return', resolve(group[0].socketId));

	            case 8:
	              _context6.next = 16;
	              break;

	            case 10:
	              _context6.prev = 10;
	              _context6.t0 = _context6['catch'](0);

	              if (!(typeof _context6.t0 == 'string')) {
	                _context6.next = 14;
	                break;
	              }

	              return _context6.abrupt('return', reject(_context6.t0));

	            case 14:
	              console.log(_context6.t0);
	              reject('GET_SOCKET_FAIL');

	            case 16:
	            case 'end':
	              return _context6.stop();
	          }
	        }
	      }, _callee6, undefined, [[0, 10]]);
	    }));

	    return function (_x11, _x12) {
	      return _ref6.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * getGroupUpset
	 * @returns {*}
	 */
	var getGroupUpset = function getGroupUpset(appName) {
	  return new _promise2.default(function () {
	    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(resolve, reject) {
	      return _regenerator2.default.wrap(function _callee7$(_context7) {
	        while (1) {
	          switch (_context7.prev = _context7.next) {
	            case 0:
	              _context7.prev = 0;
	              _context7.next = 3;
	              return db.get('group_' + appName);

	            case 3:
	              _context7.t0 = _context7.sent;
	              resolve(_context7.t0);
	              _context7.next = 13;
	              break;

	            case 7:
	              _context7.prev = 7;
	              _context7.t1 = _context7['catch'](0);
	              _context7.next = 11;
	              return db.put('group_' + appName, [], { valueEncoding: 'json' });

	            case 11:
	              _context7.t2 = _context7.sent;
	              resolve(_context7.t2);

	            case 13:
	            case 'end':
	              return _context7.stop();
	          }
	        }
	      }, _callee7, undefined, [[0, 7]]);
	    }));

	    return function (_x13, _x14) {
	      return _ref7.apply(this, arguments);
	    };
	  }());
	};

	/**
	 * 新建service
	 */
	var createService = exports.createService = function createService(appName) {
	  return new _promise2.default(function () {
	    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(resolve, reject) {
	      var group, nextService, nextGroup;
	      return _regenerator2.default.wrap(function _callee8$(_context8) {
	        while (1) {
	          switch (_context8.prev = _context8.next) {
	            case 0:
	              _context8.prev = 0;
	              _context8.next = 3;
	              return getGroupUpset(appName);

	            case 3:
	              group = _context8.sent;
	              nextService = {
	                appId: _uuid2.default.v4(),
	                appName: appName,
	                appSecret: (0, _createSecret2.default)()
	              };
	              nextGroup = group.push({
	                appId: nextService.appId,
	                socketId: null,
	                status: 0
	              });
	              _context8.next = 8;
	              return _promise2.default.all([db.put('group_' + appName, nextGroup, { valueEncoding: 'json' }), db.put('service_' + nextService.appId, nextService, { valueEncoding: 'json' })]);

	            case 8:

	              resolve(nextService);
	              _context8.next = 17;
	              break;

	            case 11:
	              _context8.prev = 11;
	              _context8.t0 = _context8['catch'](0);

	              if (!(typeof _context8.t0 == 'string')) {
	                _context8.next = 15;
	                break;
	              }

	              return _context8.abrupt('return', reject(_context8.t0));

	            case 15:
	              console.log(_context8.t0);
	              reject('CREATE_SERVICE_FAIL');

	            case 17:
	            case 'end':
	              return _context8.stop();
	          }
	        }
	      }, _callee8, undefined, [[0, 11]]);
	    }));

	    return function (_x15, _x16) {
	      return _ref8.apply(this, arguments);
	    };
	  }());
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/assign");

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/promise");

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("uuid");

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _crypto = __webpack_require__(22);

	var _crypto2 = _interopRequireDefault(_crypto);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var createSecret = function createSecret() {
	  return _crypto2.default.randomBytes(512);
	};

	exports.default = createSecret;
	module.exports = exports['default'];

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("then-levelup");

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("level");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _db = __webpack_require__(17);

	var db = _interopRequireWildcard(_db);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = function () {
	  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next) {
	    var removed;
	    return _regenerator2.default.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _context.next = 2;
	            return db.deleteService(req.body.appId);

	          case 2:
	            removed = _context.sent;

	            res.json({ appId: req.body.appId });

	          case 4:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, undefined);
	  }));

	  return function (_x, _x2, _x3) {
	    return _ref.apply(this, arguments);
	  };
	}();

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _db = __webpack_require__(17);

	var db = _interopRequireWildcard(_db);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = function () {
	  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next) {
	    return _regenerator2.default.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, undefined);
	  }));

	  return function (_x, _x2, _x3) {
	    return _ref.apply(this, arguments);
	  };
	}();

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign = __webpack_require__(18);

	var _assign2 = _interopRequireDefault(_assign);

	var _fs = __webpack_require__(28);

	var _fs2 = _interopRequireDefault(_fs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var argv = {};
	process.argv.forEach(function (val) {
	  if (val.substring(0, 2) == '--') {
	    var equalIndex = val.indexOf('=');
	    var isBoolTrue = equalIndex < 0;
	    var value = isBoolTrue ? true : val.substring(equalIndex + 1);
	    if (value == 'false') value = false;
	    if (!isNaN(Number(value))) value = Number(value);
	    argv[val.substr(2, isBoolTrue ? val.length : equalIndex - 2)] = value;
	  }
	});

	var configPath = argv.config || 'data/config/config.json';
	var configFile = JSON.parse(_fs2.default.readFileSync(configPath));

	console.log(configPath, configFile);

	exports.default = (0, _assign2.default)({}, configFile, argv);
	module.exports = exports['default'];

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(19);

	var _promise2 = _interopRequireDefault(_promise);

	var _typeof2 = __webpack_require__(30);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _regenerator = __webpack_require__(4);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _stringify = __webpack_require__(3);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _asyncToGenerator2 = __webpack_require__(5);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _getPrototypeOf = __webpack_require__(6);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _possibleConstructorReturn2 = __webpack_require__(8);

	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

	var _inherits2 = __webpack_require__(9);

	var _inherits3 = _interopRequireDefault(_inherits2);

	var _uuid = __webpack_require__(20);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _socket = __webpack_require__(31);

	var _socket2 = _interopRequireDefault(_socket);

	var _Router2 = __webpack_require__(14);

	var _Router3 = _interopRequireDefault(_Router2);

	var _Emitter = __webpack_require__(32);

	var _Emitter2 = _interopRequireDefault(_Emitter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var App = function (_Router) {
	  (0, _inherits3.default)(App, _Router);

	  function App() {
	    var _Object$getPrototypeO,
	        _this3 = this;

	    var _temp, _this, _ret;

	    (0, _classCallCheck3.default)(this, App);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_Object$getPrototypeO = (0, _getPrototypeOf2.default)(App)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
	      /**
	       * 是否启动
	       */
	      isStarted: false,
	      /**
	       * 是否已经连接上hub
	       */
	      isOnline: false,
	      /**
	       * 是否已经注册, 只有注册后才能调用其他service
	       */
	      isRegistered: false,

	      importEmitterStack: {}
	    }, _this.handleRequest = function () {
	      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req) {
	        var socket, _this2, handleLoop, exportActionStack, res, next;

	        return _regenerator2.default.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                socket = _this.state.socket;
	                _this2 = _this;
	                handleLoop = _this2.handleLoop;
	                exportActionStack = _this2.exportActionStack;

	                console.log('[seashell] handle request: ' + (0, _stringify2.default)(req));
	                res = {
	                  headers: {
	                    appId: req.headers.appId,
	                    callbackId: req.headers.callbackId
	                  },
	                  body: {},
	                  end: function end() {
	                    socket.emit('I_HAVE_HANDLE_THIS_REQUEST', {
	                      headers: res.headers,
	                      body: res.body
	                    });
	                  }
	                };

	                next = function next(err, req, res, index, pathname) {
	                  return handleLoop(err, req, res, next, index, pathname);
	                };

	                next(null, req, res, 0, req.headers.originUrl);

	              case 8:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, _this3);
	      }));

	      return function (_x) {
	        return _ref.apply(this, arguments);
	      };
	    }(), _this.request = function (url) {
	      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	      if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) != 'object') throw '[seashell] request data must be an object.';
	      var _this$state = _this.state;
	      var socket = _this$state.socket;
	      var importEmitterStack = _this$state.importEmitterStack;
	      var appId = _this$state.appId;

	      return new _promise2.default(function (resolve, reject) {
	        try {
	          var _ret2 = function () {
	            if (!_this.state.isOnline) return {
	                v: reject("YOUR_SERVICE_IS_OFFLINE")
	              };
	            /**
	             * parse url, create req object
	             */
	            var callbackId = _uuid2.default.v4();
	            var req = {
	              body: data,
	              headers: {
	                appId: appId,
	                callbackId: callbackId
	              }
	            };
	            var s = url.search('/');
	            if (s < 0) {
	              req.headers.importAppName = url;
	              req.headers.originUrl = '/';
	            } else {
	              var sUrl = s == 0 ? url.substr(1) : url;
	              var ss = sUrl.search('/');
	              req.headers.importAppName = sUrl.substring(0, ss);
	              req.headers.originUrl = sUrl.substring(ss);
	            }

	            console.log('[seashell] Start request servicehub, data: ' + (0, _stringify2.default)(req));

	            /**
	             * set callback
	             * @type {Emitter}
	             */
	            importEmitterStack[callbackId] = new _Emitter2.default();
	            importEmitterStack[callbackId].on('RESPONSE', function (res) {
	              resolve(res);
	              delete importEmitterStack[callbackId];
	              return null;
	            });

	            /**
	             * send request
	             */
	            socket.emit('I_HAVE_A_REQUEST', req);
	          }();

	          if ((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
	        } catch (e) {
	          console.log('[seashell] ' + (e.stack || e));
	          reject(e);
	        }
	      });
	    }, _this.connect = function () {
	      var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	      if (_this.state.isStarted) return false;
	      console.log('[seashell] connection options: ' + (0, _stringify2.default)(opts));
	      var app = _this;
	      var _this4 = _this;
	      var handleRequest = _this4.handleRequest;

	      var socket = (0, _socket2.default)(opts.url);
	      _this.setState({
	        opts: opts,
	        appId: opts.key.appId,
	        isStarted: true,
	        socket: socket
	      });

	      socket.on('connect', function () {
	        console.log('[seashell] connected');
	        console.log('[seashell] register');
	        app.setState({ isOnline: true });

	        /**
	         * IMPORTANT, every service should registered to work.
	         */
	        socket.emit('REGISTER', opts.key);
	      });

	      /**
	       * handle hub's response about register
	       * if there's some error, means register has failed
	       * otherwise, it succeed
	       */
	      socket.on('YOUR_REGISTER_HAS_RESPONSE', function (response) {
	        app.setState({
	          isRegistered: true
	        });
	      });

	      /**
	       * handle response
	       * response should have `callbackId` key.
	       */
	      socket.on('YOUR_REQUEST_HAS_RESPONSE', function (res) {
	        var importEmitterStack = _this.state.importEmitterStack;
	        var callbackId = res.headers.callbackId;

	        importEmitterStack[callbackId].emit('RESPONSE', res);
	        delete importEmitterStack[callbackId];
	        app.setState({
	          importEmitterStack: importEmitterStack
	        });
	      });

	      /**
	       * handle request
	       */
	      socket.on('PLEASE_HANDLE_THIS_REQUEST', handleRequest);

	      /**
	       * listing disconnect event
	       */
	      socket.on('disconnect', function () {
	        console.log('[seashell] lost connection');
	        app.setState({ isOnline: false });
	      });
	    }, _this.disconnect = function () {
	      if (_this.state.isStarted) {
	        var socket = _this.state.socket;

	        socket.disconnect();
	      }
	      console.log('[seashell] disconnected');
	    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
	  }

	  /**
	   * receive & handle message from hub
	   * @param req
	   */


	  /**
	   * push a request to MQ hub.
	   * @param url `/${appname}/${originUrl}`
	   * @param data
	   * @returns {Promise}
	   *
	   * use `socket.emit` to push request
	   * push a event callback to importEmitterStack every request
	   * listening on `RESPONSE` event and return data
	   */


	  /**
	   * connect to MQ hub.
	   * @param opts
	   * @returns {boolean}
	   */


	  /**
	   * disconnect with server
	   * @returns {boolean}
	   */


	  return App;
	}(_Router3.default);

	exports.default = App;
	module.exports = exports['default'];

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/typeof");

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = require("socket.io-client");

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Emitter = function Emitter() {
	  var _this = this;

	  (0, _classCallCheck3.default)(this, Emitter);
	  this.state = {};

	  this.on = function (eventName, callback) {
	    if (typeof callback === 'function') {
	      return _this.state[eventName] = callback;
	    }
	  };

	  this.emit = function (eventName, data) {
	    if (typeof _this.state[eventName] === 'function') {
	      _this.state[eventName](data);
	    }
	  };
	};

	exports.default = Emitter;
	module.exports = exports['default'];

/***/ }
/******/ ]);