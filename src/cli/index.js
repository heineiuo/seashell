/**
 * pnp means pull and push
 */

import {argv} from 'yargs'
import {fail} from './show'
import devProxy from './devProxy'
import devServer from './devServer'
import build from './build'
import {info} from './show'

const help = () => new Promise(async (resolve, reject) => {
  info(
`
All Commands:
help, ${Object.keys(commands).join(', ')}

seashell build --entry=[entry file path]     Build app.
seashell dev proxy --entry=[entry file path] Start a http server to proxy app.
`
  )
  resolve()
})

const commands = {
  devProxy,
  devServer,
  build,
  help,
  dev: {
    server: devServer,
    proxy: devProxy
  }
}

process.nextTick(async () => {
  try {
    const userCommands = argv._.slice();

    const walkToExecCommand = (commands) => new Promise(async (resolve, reject) => {
      const command = commands[userCommands[0]];
      if (typeof command === 'undefined') return reject(new Error('Command not found! '))
      try {
        if (typeof command === 'function') return resolve(await command())
        userCommands.shift();
        resolve(await walkToExecCommand(command))
      } catch(e){
        reject(e)
      }
    })

    await walkToExecCommand(commands)

  } catch(e){
    fail(`${e.name}: ${e.message}`)
  }
})
