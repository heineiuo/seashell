const buildParams = (match, pathParsed) => {

  const params = {};
  match.map((item, index) => {
    if (pathParsed[index].hasOwnProperty('name')) {
      params[pathParsed[index].name] = item;
    }
  });
  return params;
};

export {
  buildParams
}