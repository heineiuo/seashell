import Base from './Base'
import errHandleChecker from './errHandleChecker'

class Router extends Base {

  exportActionStack = []

  /**
   * use
   */
  use = function() {
    var pathname, middleware
    if (arguments.length == 1) {
      pathname = ''
      middleware = arguments[0]
    } else {
      pathname = arguments[0]
      middleware = arguments[1]
    }

    const {exportActionStack} = this
    const item = {
      path: pathname,
      isErrorHandle: false
    }
    if (middleware instanceof Function) {
      item.isErrorHandle = errHandleChecker(middleware)
      item.fn = middleware
    } else {
      item.router = middleware
    }
    exportActionStack.push(item)
  }

  handleLoop = (err, req, res, _next, _index, _pathname) => {
    const {exportActionStack} = this

    /**
     * 开始执行
     */
    var index = -1
    next(err)

    /**
     * 流程控制
     */
    function next(err) {
      index ++

      /**
       * 检查指针
       * 流程结束, 收尾
       * 错误检查
       * 404 检查
       */
      if(index >= exportActionStack.length) {
        if (err) console.error(err)
        return _next(err, req, res, _next, _index)
      }

      var middleware = exportActionStack[index]

      console.log(middleware)

      /**
       * 错误处理中间件
       * 检查是否有错误要处理
       * 有错误: 跳过普通中间件, 找到错误处理中间件处理错误
       * 没错误: 跳过错误中间件
       */
      if (middleware.isErrorHandle && err) return run('error', middleware)
      if (err) return next(err)

      /**
       * 路由中间件
       */
      if (middleware.router) return run('router', middleware)

      /**
       * 普通中间件
       * 不匹配: 直接next
       * 匹配: run()
       */
      if (typeof middleware.path != 'undefined') {
        console.log(`middleware.baseUrl ${middleware.baseUrl}`)
        if (middleware.path != _pathname)
          return next()
        run(null, middleware)
      }

      /**
       * 中间件执行
       */
      function run(type, middleware){
        console.log('run')
        console.log(type)
        try{
          if (type == 'error') {
            console.log(err)
            if (middleware.router) return next(err)
            return middleware.fn(err, req, res, next)
          }

          if (type == 'router') {
            const nextPathname = _pathname.substr(middleware.path.length)
            return middleware.router
              .handleLoop(err, req, res, next, index, nextPathname)
          }

          return middleware.fn(req, res, next)
        } catch(e){
          console.log(e)
          console.log(e.stack)
          next(e)
        }
      }
    }
  }

}

export default Router