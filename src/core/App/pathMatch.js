import * as log from '../log'


const pathMatch = (re, pathname, params={}) => {
  const match = re.exec(pathname);
  const keys = re.keys;
  if (!match) return false;

  keys.forEach((key, index) => {
    const param = match[index + 1];
    if (!param) return null;
    params[key.name] = decodeParam(param);
    if (key.repeat) params[key.name] = params[key.name].split(key.delimiter)
  });

  return params;
};

const decodeParam = (param) => {
  try {
    return decodeURIComponent(param);
  } catch (e) {
    throw new Error('failed to decode param "' + param + '"')
  }
};

export {
  pathMatch
}