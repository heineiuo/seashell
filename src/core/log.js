import chalk from 'chalk'
const SeashellChalk = (color) => (msg) => {
  const log = chalk[color].bold(`[Seashell] ${msg}`);
  console.log(log)
};

const info = SeashellChalk('white');
const error = SeashellChalk('red');
const warn = SeashellChalk('yellow');

export {
  info, warn, error
}