import {App, Router} from '../src/client'


test('handle loop', async () => {
  try {

    const router = new Router();
    const app = new App();

    router.use((ctx, next) => {
      console.log('hi');
      next()
    });

    router.use((ctx, next) => {
      ctx.send('hi')
    });

    const ctx = {
      request: {
        headers: {
          originUrl: '/hi'
        }
      },
      emit: (type, data) => {
        console.log(type, data)
      },
      send: 'hi'
    };

    await router.handleLoop(ctx);

  } catch(e){
    console.log(e)
  }

});


test('app handle request', async () => {

  const router = new Router();
  const app = new App();

  router.use((ctx, next) => {
    console.log('rotuer: hi');
    next()
  });

  router.use((ctx, next) => {
    ctx.send('hi')
  });

  app.use((ctx, next) => {
    ctx.on('end', () => {
      console.log('ctx listen end emit')
    })

    next()
  });

  app.use('/hi', router);

  app.handleRequest({
    headers: {
      originUrl: '/hi'
    }
  })

});
