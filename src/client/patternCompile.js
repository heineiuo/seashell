/**
 * @param template {string} url template to match truly url
 * @param raw {string} truly url
 */
const patternCompile = (template, raw) => {
  const result = {
    match: false,
    params: {}
  };

  const getArray = (string) => {
    return string.split('/').filter(item => item!= '')
  };

  const templateArray = getArray(template);
  const rawArray = getArray(raw);

  if (templateArray.length != rawArray.length) return result;

  const walkToCompareAndCreateParam = (index) => {
    if (index == templateArray.length) {
      result.match = true;
      return result
    }

    if (templateArray[index][0] == ':') {
      result.params[templateArray[index].substr(1)] = rawArray[index]
    } else {
      if (templateArray[index] != rawArray[index]) return result
    }

    index ++;
    return walkToCompareAndCreateParam(index)
  };

  return walkToCompareAndCreateParam(0, [])

};

export default patternCompile
