import {argv} from 'yargs'
import path from 'path'
import shelljs from 'shelljs'

export default () => {

  if (!shelljs.which('babel-node')) return console.error('[SEASHELL] Please install babel-node first')
  let extraCommand = '';
  if (argv.port) extraCommand += ` --port ${argv.port}`
  shelljs.exec(`babel-node ${path.resolve(__dirname, './server.js')} ${extraCommand}`);

};
