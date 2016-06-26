'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Base2 = require('./Base');

var _Base3 = _interopRequireDefault(_Base2);

var _errHandleChecker = require('./errHandleChecker');

var _errHandleChecker2 = _interopRequireDefault(_errHandleChecker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Router = function (_Base) {
  _inherits(Router, _Base);

  function Router() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Router);

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Router)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.exportActionStack = [], _this.use = function () {
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
         */

        var run = function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(type, middleware) {
            var nextPathname;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;

                    if (!(type == 'error')) {
                      _context.next = 5;
                      break;
                    }

                    if (!middleware.router) {
                      _context.next = 4;
                      break;
                    }

                    return _context.abrupt('return', next(err));

                  case 4:
                    return _context.abrupt('return', middleware.fn(err, req, res, next));

                  case 5:
                    if (!(type == 'router')) {
                      _context.next = 8;
                      break;
                    }

                    nextPathname = _pathname.substr(middleware.path.length);
                    return _context.abrupt('return', middleware.router.handleLoop(err, req, res, next, index, nextPathname));

                  case 8:
                    _context.next = 10;
                    return middleware.fn(req, res, next);

                  case 10:
                    return _context.abrupt('return', _context.sent);

                  case 13:
                    _context.prev = 13;
                    _context.t0 = _context['catch'](0);

                    console.log('[seashell] catch error: ' + (_context.t0.stack || _context.t0));
                    next(_context.t0);

                  case 17:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this, [[0, 13]]);
          }));

          return function run(_x, _x2) {
            return ref.apply(this, arguments);
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
          if (err) console.log('[seashell] unhandled error: ' + (err.stack || err));
          return _next(err, req, res, _next, _index);
        }

        var middleware = exportActionStack[index];

        /**
         * 错误处理中间件
         * 检查是否有错误要处理
         * 有错误: 跳过普通中间件, 找到错误处理中间件处理错误
         * 没错误: 跳过错误中间件
         */
        if (middleware.isErrorHandle && err) return run('error', middleware);
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
          if (middleware.path != _pathname) return next();
          run(null, middleware);
        }
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * use
   */


  return Router;
}(_Base3.default);

exports.default = Router;