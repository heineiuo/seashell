import {App, Router} from '../src/client'

test('app handle request', async () => {

  const router = new Router();
  const app = new App();

  router.use((ctx, next) => {
    console.log('2')
    // throw new Error('wow, it is an error')

    // console.log('rotuer: hi');
    next()
  });

  router.use('/yo', (ctx, next) => {
    console.log('2.1 yo');
    next()
  });

  router.use('/hi/yo', (ctx, next) => new Promise((resolve,reject) =>{

    setTimeout(async () => {
      console.log('2.2 yo');
      await next()
      resolve()
    }, 10000)
  }));

  router.use((ctx, next) => {
    console.log('3')

    ctx.response.end()
  });

  app.state.socket = {
    emit: () => 'mock socket emit'
  }

  app.use(async (ctx, next) => {
    console.log('1')
    const t = Date.now();
    ctx.on('end', () => {
      expect.anything();
      console.log('ctx listen end emit')
    });

    ctx.on('error', (e) => {
      console.log(e)
    });

    await next();
    console.log(`${Date.now() - t}ms`)
    console.log('success')
  });

  app.use('/hi', router);


  app.handleRequest({
    headers: {
      originUrl: '/hi/yo'
    }
  })

});


setInterval(console.log, 10)
