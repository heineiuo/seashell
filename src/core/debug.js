import prettyjson from 'prettyjson'
import chalk from 'chalk'

const SeashellChalk = chalk.blue.bold('[Seashell]');

const SeashellDebug = (type, ...logs) => {
  let result = `${SeashellChalk}[${type}]`;
  logs.forEach((log, index) => {
    if (index > 0) result += '\n';
    if (typeof log == 'string') {
      result += log;
    } else if (typeof log == 'object') {
      if (log.name && log.message && log.stack) {
        result += `[ERROR]:${'\n'}${log.stack}`
      } else {
        result += `[JSON]:${'\n'}${prettyjson.render(log)}`;
      }
    }
  });

};

export {
  SeashellDebug
}