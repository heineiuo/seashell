import * as log from './log'

const SeashellDebug = (type, ...logs) => {
  let result = `[${type}]`;
  logs.forEach((log, index) => {
    if (index > 0) result += '\n';
    if (typeof log === 'string') {
      result += log;
    } else if (typeof log === 'object') {
      if (log.name && log.message && log.stack) {
        result += `[ERROR]:${'\n'}${log.stack}`
      } else {
        result += `[JSON]:${'\n'}${JSON.stringify(log)}`;
      }
    }
  });

  type === 'ERROR' ?
    log.error(result):
    log.info(result)

};

export {
  SeashellDebug
}
