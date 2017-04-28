const clearUnsafeHeaders = (req) => {
  if (req instanceof Object) return JSON.stringify(req);
  return req
};

export {
  clearUnsafeHeaders
}
