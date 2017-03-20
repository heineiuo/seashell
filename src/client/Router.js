import pathToRegexp from 'path-to-regexp'
import {pathMatch} from './pathMatch'

class Router {

  exportActionStack = [];

  /**
   * use
   */
  use = (...args) => {
    const {exportActionStack} = this;
    let path, middleware;
    if (args.length == 1) {
      path = '*';
      middleware = args[0]
    } else {
      path = args[0];
      middleware = args[1]
    }

    const item = {
      path,
      pathRe: pathToRegexp(path),
      pathParsed: pathToRegexp.parse(path)
    };
    if (middleware instanceof Function) {
      item.fn = async (ctx, next) => {
        try {
          await middleware(ctx, next)
        } catch(e){
          ctx.emit('error', e)
        }
      }
    } else {
      item.router = middleware
    }
    exportActionStack.push(item)
  };

  /**
   * @param ctx
   * @param parentNext
   */
  handleLoop = (ctx, parentNext) => {
    let index = -1;
    const next = () => {
      index ++;
      const middleware = this.exportActionStack[index];
      /**
       * 如果该路由已经跑完，则进入下一个路由
       * 否则，先判断是不是路由中间件，如果是路由中间件，则进入子路由
       * 否则处理普通中间件，如果匹配，则执行
       * 否则进入下一个中间件
       */
      if (!middleware) {
        if (!parentNext) return ctx.emit('end');
        return parentNext();
      }
      if (middleware.router) return middleware.router.handleLoop(ctx, next);
      if (middleware.path == '*') return middleware.fn(ctx, next);
      const params = pathMatch(middleware.pathRe, ctx.request.headers.originUrl);
      if (!params) return next();
      Object.assign(ctx.request.params, params);
      return middleware.fn(ctx, next)
    };

    return next();
  }
}

export default Router
