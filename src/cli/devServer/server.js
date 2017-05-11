import Seashell from 'seashell'
// import Seashell from '../..'
import httpServer from './httpServer'
import allActionCreators from './actions'
import getNedb, {getConfig} from './nedb'
import {createDispatch} from 'action-creator'

const app = new Seashell({server: httpServer});

app.use(async (ctx, next) => {
  ctx.getNedb = getNedb;
  ctx.getConfig = getConfig;
  ctx.json = (json) => {
    ctx.response.body = json
    ctx.response.end()
  };
  ctx.setHeader = (header) => {
    Object.assign(ctx.response.headers, header);
  };
  ctx.error = (error) => ctx.json({error});
  ctx.on('error', (err) => {
    console.error(chalk.red('[SEASHELL][INTEGRATE SERVICE] '+err.message + err.stack));
    if (err.name === 'ValidationError') return ctx.error('PARAM_ILLEGAL');
    if (err.message === 'Command failed') return ctx.error('COMMAND_FAILED');
    return ctx.error(err.message);
  });
  ctx.on('end', () => {
    if (!ctx.state.isHandled) {
      ctx.response.body = {error: 'CAN_NOT_HANDLE_TIS_REQUEST'};
      ctx.response.end()
    }
  });
  next()
});

app.use(async ctx => {
  const paths = ctx.request.headers.originUrl.split('/').filter(item => item !== '')
  const walk = async (currentActionCreators) => {
    if (paths.length === 0) return ctx.error('NOT_FOUND');
    const currentAction = currentActionCreators[paths.shift()];
    if (typeof currentAction === 'undefined') return ctx.error('NOT_FOUND');
    if (typeof currentAction === 'object' ) {
      return process.nextTick(() => walk(currentAction))
    }
    if (typeof currentAction === 'function') {
      if (paths.length > 0) return ctx.error('NOT_FOUND');
      const dispatch = createDispatch(ctx);
      const actionType = dispatch(currentAction(ctx.request.body));
      if (actionType instanceof Promise) {
        try {
          const result = await actionType;
          ctx.json(result)
        } catch(e){
          ctx.error(e);
        }
      }
      return null;
    }
    return ctx.error('ERROR_TYPE_OF_ACTION')
  }
  process.nextTick(() => walk(allActionCreators))
})


process.nextTick(async () => {
  const nedb = (await getNedb()).collection('socket');
  nedb.remove({}, {multi: true});
  httpServer.start(app);
})
