import chalk from 'chalk'
import {render} from 'prettyjson'

export const show = (color=null, text='', format=false) => {
  const rendered = format ? render(text) : text
  const colored = color === null ? a => a : chalk[color]
  console.log(colored(rendered))
}

export const fail = (...args) => show('red', ...args)
export const success = (...args) => show('green', ...args)
export const info = (...args) => show('yellow', ...args)
