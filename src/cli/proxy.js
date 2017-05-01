import proxy from '../proxy'
import {argv} from 'yargs'
import path from 'path'

export default () => {

  if (!argv.target) return console.log('[SEASHELL] param target lost.');
  const targetPath = path.resolve(process.cwd(), argv.target);
  process.nextTick(async () => {
    try {
      // proxy(await import('./targetPath'))
      const code = require(targetPath) 
      proxy(code)
    } catch(e){
      console.log(e)
    }
  })
};
