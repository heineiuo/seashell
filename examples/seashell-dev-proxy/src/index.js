import {argv} from 'yargs'
import path from 'path'
import shelljs from 'shelljs'

export default () => {

  if (!shelljs.which('babel-node')) return console.error('[SEASHELL] Please install babel-node first')
  if (!argv.entry) return console.log('[SEASHELL] Lost param: entry');
  const entryFile = path.resolve(process.cwd(), argv.entry);
  shelljs.exec(`babel-node ${path.resolve(__dirname, './server.js')} --entryFile=${entryFile}`);

};
