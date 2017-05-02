import {argv} from 'yargs'
import shelljs from 'shelljs'
import path from 'path'
import proxy from '../devProxy'

process.nextTick(() => {
  const {entryFile} = argv;
  let app = require(entryFile);
  if (!app.hasOwnProperty('requestSelf')) app = app.default;
  if (!app.hasOwnProperty('requestSelf')) return console.log('[SEASHELL] Illegal entry module')
  proxy(app)
})
