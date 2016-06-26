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