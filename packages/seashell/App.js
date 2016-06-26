'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _Router2 = require('./Router');

var _Router3 = _interopRequireDefault(_Router2);

var _Emitter = require('./Emitter');

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_Router) {
  _inherits(App, _Router);

  function App() {
    var _Object$getPrototypeO,
        _this3 = this;

    var _temp, _this, _ret;

    _classCallCheck(this, App);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(App)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
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
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
        var socket, _this2, handleLoop, exportActionStack, res, next;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                socket = _this.state.socket;
                _this2 = _this;
                handleLoop = _this2.handleLoop;
                exportActionStack = _this2.exportActionStack;

                console.log('[seashell] handle request: ' + JSON.stringify(req));
                res = {
                  headers: {
                    appId: req.headers.appId,
                    callbackId: req.headers.callbackId
                  },
                  body: {},
                  end: function end() {
                    socket.emit('I_HAVE_HANDLE_THIS_REQUEST', res);
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
        return ref.apply(this, arguments);
      };
    }(), _this.request = function (url, data) {
      var _this$state = _this.state;
      var socket = _this$state.socket;
      var importEmitterStack = _this$state.importEmitterStack;
      var appId = _this$state.appId;

      return new Promise(function (resolve, reject) {
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

            console.log('[seashell] Start request servicehub, data: ' + JSON.stringify(req));

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

          if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
        } catch (e) {
          console.log('[seashell] ' + (e.stack || e));
          reject(e);
        }
      });
    }, _this.connect = function () {
      var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (_this.state.isStarted) return false;
      console.log('[seashell] connection options: ' + JSON.stringify(opts));
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
        console.log('[seashell] disconnected');
        app.setState({ isOnline: false });
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
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


  return App;
}(_Router3.default);

exports.default = App;