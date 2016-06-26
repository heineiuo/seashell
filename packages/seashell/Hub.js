'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Base2 = require('./Base');

var _Base3 = _interopRequireDefault(_Base2);

var _globPromise = require('glob-promise');

var _globPromise2 = _interopRequireDefault(_globPromise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _watch = require('watch');

var _watch2 = _interopRequireDefault(_watch);

var _nedbPromise = require('nedb-promise');

var _nedbPromise2 = _interopRequireDefault(_nedbPromise);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Hub = function (_Base) {
  _inherits(Hub, _Base);

  function Hub() {
    var _Object$getPrototypeO,
        _this2 = this;

    var _temp, _this, _ret;

    _classCallCheck(this, Hub);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Hub)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {}, _this.checkServiceFormat = function (serviceData) {
      return new Promise(function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(typeof serviceData.appSecret != 'string')) {
                    _context.next = 2;
                    break;
                  }

                  return _context.abrupt('return', reject('Service Defination Format Error'));

                case 2:
                  if (!(typeof serviceData.appName != 'string')) {
                    _context.next = 4;
                    break;
                  }

                  return _context.abrupt('return', reject('Service Defination Format Error'));

                case 4:
                  resolve(true);

                case 5:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x, _x2) {
          return ref.apply(this, arguments);
        };
      }());
    }, _this.addNewServiceByFilePath = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(filepath) {
        var _this3, checkServiceFormat, Service, data, serviceData;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;

                if (!(_path2.default.extname(filepath) !== '.json')) {
                  _context2.next = 3;
                  break;
                }

                throw new Error('file extname must be `json`!');

              case 3:
                _this3 = _this;
                checkServiceFormat = _this3.checkServiceFormat;
                Service = _this.state.Service;
                _context2.next = 8;
                return _fsPromise2.default.readFile(filepath, 'UTF-8');

              case 8:
                data = _context2.sent;
                serviceData = JSON.parse(data);

                serviceData.appId = _path2.default.basename(filepath, '.json');
                serviceData.socketId = null;
                serviceData.online = 0;

                if (checkServiceFormat(serviceData)) {
                  _context2.next = 15;
                  break;
                }

                throw new Error('Service Defination Format Error');

              case 15:
                _context2.next = 17;
                return Service.insert(serviceData);

              case 17:
                _context2.next = 22;
                break;

              case 19:
                _context2.prev = 19;
                _context2.t0 = _context2['catch'](0);

                console.error(_context2.t0);

              case 22:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2, [[0, 19]]);
      }));

      return function (_x3) {
        return ref.apply(this, arguments);
      };
    }(), _this.updateServiceByFilePath = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(filepath) {
        var Service, _this4, checkServiceFormat, data, serviceData, appId;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                Service = _this.state.Service;
                _this4 = _this;
                checkServiceFormat = _this4.checkServiceFormat;
                data = _fsPromise2.default.readFile(filepath, 'UTF-8');
                serviceData = JSON.parse(data);
                appId = _path2.default.basename(filepath, '.json');

                serviceData.socketId = null;
                serviceData.online = 0;
                _context3.next = 11;
                return checkServiceFormat(serviceData);

              case 11:
                if (_context3.sent) {
                  _context3.next = 13;
                  break;
                }

                throw Error('Service Defination Format Error');

              case 13:
                _context3.next = 15;
                return Service.update({ appId: appId }, { $set: serviceData }, {});

              case 15:
                _context3.next = 20;
                break;

              case 17:
                _context3.prev = 17;
                _context3.t0 = _context3['catch'](0);

                console.error(_context3.t0);

              case 20:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2, [[0, 17]]);
      }));

      return function (_x4) {
        return ref.apply(this, arguments);
      };
    }(), _this.removeServiceByFilePath = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(filePath) {
        var Service, appId;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                Service = _this.state.Service;
                appId = _path2.default.basename(filePath, '.json');
                _context4.next = 4;
                return Service.remove({ appId: appId }, {});

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x5) {
        return ref.apply(this, arguments);
      };
    }(), _this.empty = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
      var Service;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              Service = _this.state.Service;
              _context5.next = 4;
              return Service.remove({}, { multi: true });

            case 4:
              _context5.next = 9;
              break;

            case 6:
              _context5.prev = 6;
              _context5.t0 = _context5['catch'](0);

              console.error(_context5.t0);

            case 9:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this2, [[0, 6]]);
    })), _this.handleRequest = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(socket, req) {
        var _this$state, Service, io, res, importAppName, doc, service;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _this$state = _this.state;
                Service = _this$state.Service;
                io = _this$state.io;

                console.log('import:' + JSON.stringify(req));

                if (req.headers.callbackId) {
                  _context6.next = 6;
                  break;
                }

                throw new Error('LOST_CALLBACKID');

              case 6:
                res = {
                  headers: {
                    callbackId: req.headers.callbackId
                  },
                  body: {}
                };
                _context6.prev = 7;
                importAppName = req.headers.importAppName;
                /**
                 * 验证请求是否合法
                 */

                _context6.next = 11;
                return Service.findOne({ socketId: socket.id });

              case 11:
                doc = _context6.sent;

                if (doc) {
                  _context6.next = 14;
                  break;
                }

                throw new Error('PERMISSION_DENIED');

              case 14:
                _context6.next = 16;
                return Service.findOne({ online: 1, appName: importAppName });

              case 16:
                service = _context6.sent;

                if (service) {
                  _context6.next = 19;
                  break;
                }

                throw new Error("TARGET_SERVICE_OFFLINE");

              case 19:
                /**
                 * 发包给目标app
                 */
                io.sockets.connected[service.socketId].emit('PLEASE_HANDLE_THIS_REQUEST', req);
                console.log('\n         hub emit client \'' + importAppName + '\' to handle request \'' + req.headers.originUrl + '\'\n      ');
                _context6.next = 28;
                break;

              case 23:
                _context6.prev = 23;
                _context6.t0 = _context6['catch'](7);

                console.log(_context6.t0);
                res.body = { error: _context6.t0 };
                return _context6.abrupt('return', socket.emit('YOUR_REQUEST_HAS_RESPONSE', res));

              case 28:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this2, [[7, 23]]);
      }));

      return function (_x6, _x7) {
        return ref.apply(this, arguments);
      };
    }(), _this.handleResponse = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(socket, res) {
        var _this$state2, Service, io, doc, targetSocket;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _this$state2 = _this.state;
                Service = _this$state2.Service;
                io = _this$state2.io;
                _context7.prev = 3;

                if (res.headers.appId) {
                  _context7.next = 6;
                  break;
                }

                throw new Error('Export Lost Params: [appId]');

              case 6:
                if (res.headers.callbackId) {
                  _context7.next = 8;
                  break;
                }

                throw new Error('Export Lost Params: [callbackId]');

              case 8:
                _context7.next = 10;
                return Service.findOne({ appId: res.headers.appId });

              case 10:
                doc = _context7.sent;
                targetSocket = io.sockets.connected[doc.socketId];

                if (targetSocket) targetSocket.emit('YOUR_REQUEST_HAS_RESPONSE', res);
                _context7.next = 18;
                break;

              case 15:
                _context7.prev = 15;
                _context7.t0 = _context7['catch'](3);

                console.error(_context7.t0);

              case 18:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, _this2, [[3, 15]]);
      }));

      return function (_x8, _x9) {
        return ref.apply(this, arguments);
      };
    }(), _this.handleRegister = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(socket, data) {
        var Service, insertData, doc;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                Service = _this.state.Service;
                _context8.prev = 1;

                console.log('register');
                console.log(data);
                console.log(socket.id);

                if (socket.id) {
                  _context8.next = 7;
                  break;
                }

                throw new Error('LOST_SOCKET_ID');

              case 7:
                insertData = {
                  online: 1,
                  appId: data.appId,
                  socketId: socket.id,
                  appSecret: data.appSecret
                };
                _context8.next = 10;
                return Service.findOne({
                  appId: insertData.appId,
                  appSecret: insertData.appSecret
                });

              case 10:
                doc = _context8.sent;

                if (doc) {
                  _context8.next = 13;
                  break;
                }

                throw new Error("PERMISSION_DENIED");

              case 13:
                _context8.next = 15;
                return Service.update({ appId: insertData.appId }, { $set: insertData }, {});

              case 15:
                socket.emit('YOUR_REGISTER_HAS_RESPONSE', { success: 1 });
                _context8.next = 21;
                break;

              case 18:
                _context8.prev = 18;
                _context8.t0 = _context8['catch'](1);

                socket.emit('YOUR_REGISTER_HAS_RESPONSE', { error: _context8.t0 });

              case 21:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, _this2, [[1, 18]]);
      }));

      return function (_x10, _x11) {
        return ref.apply(this, arguments);
      };
    }(), _this.start = function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var Hub, _this5, addNewServiceByFilePath, updateServiceByFilePath, removeServiceByFilePath;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                if (!_this.state.isStarted) {
                  _context11.next = 2;
                  break;
                }

                return _context11.abrupt('return', false);

              case 2:
                Hub = _this;
                _this5 = _this;
                addNewServiceByFilePath = _this5.addNewServiceByFilePath;
                updateServiceByFilePath = _this5.updateServiceByFilePath;
                removeServiceByFilePath = _this5.removeServiceByFilePath;


                opts.port = opts.port || 3311;

                _context11.prev = 8;
                return _context11.delegateYield(regeneratorRuntime.mark(function _callee10() {
                  var Service, io, files;
                  return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          /**
                           * Create an `nedb` instance
                           * @type {datastore}
                           */
                          Service = new _nedbPromise2.default({
                            filename: 'data/db/Service.db',
                            autoload: true
                          });

                          /**
                           * Create a socket instance
                           */

                          io = (0, _socket2.default)();


                          Hub.setState({
                            Service: Service,
                            io: io,
                            opts: opts
                          });

                          /**
                           * this dir is placed to store service configure files
                           * this dir will not automatic update
                           */
                          _mkdirp2.default.sync('data/service');

                          /**
                           * empty old registerd services
                           */
                          _context10.next = 6;
                          return Hub.empty();

                        case 6:
                          _context10.next = 8;
                          return (0, _globPromise2.default)('data/service/**/*.json', {});

                        case 8:
                          files = _context10.sent;

                          if (!files.length) console.warn('none service defination file found');

                          /**
                           * register services and listen changes.
                           */
                          files.forEach(function (item) {
                            addNewServiceByFilePath(item);
                          });
                          _watch2.default.createMonitor('data/service', function (monitor) {
                            monitor.on("created", addNewServiceByFilePath);
                            monitor.on("changed", updateServiceByFilePath);
                            monitor.on("removed", removeServiceByFilePath);
                          });

                          /*****************
                           *
                           * socket.io server monitor
                           *
                           ****************/

                          /**
                           * handle connection
                           */
                          io.on('connection', function (socket) {
                            console.log('new connection ' + socket.id);
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
                            socket.on('disconnect', _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
                              return regeneratorRuntime.wrap(function _callee9$(_context9) {
                                while (1) {
                                  switch (_context9.prev = _context9.next) {
                                    case 0:
                                      console.log(socket.id + ' disconnected');
                                      _context9.next = 3;
                                      return Service.update({ socketId: socket.id }, { $set: {
                                          socketId: null,
                                          online: 0
                                        } }, {});

                                    case 3:
                                    case 'end':
                                      return _context9.stop();
                                  }
                                }
                              }, _callee9, _this2);
                            })));
                          });

                          /**
                           * listing on a port
                           */
                          console.log('listening on port ' + opts.port);
                          io.listen(opts.port);

                        case 15:
                        case 'end':
                          return _context10.stop();
                      }
                    }
                  }, _callee10, _this2);
                })(), 't0', 10);

              case 10:
                _context11.next = 15;
                break;

              case 12:
                _context11.prev = 12;
                _context11.t1 = _context11['catch'](8);
                throw _context11.t1;

              case 15:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, _this2, [[8, 12]]);
      }));

      return function (_x12) {
        return ref.apply(this, arguments);
      };
    }(), _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * check service's format
   * @return Promise
   */


  /**
   * add a new service config file
   * @param filepath
   */


  /**
   * update a service config
   * @param filepath
   */


  /**
   * remove a service config file
   * @param filePath
   */


  /**
   * empty all services
   * @returns Promise
   */


  /**
   * receive request from a service
   * 1. get request data
   * 2. validate service permission
   * 3. pipe request to target service
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