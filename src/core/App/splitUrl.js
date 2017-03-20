const splitUrl = (url) => {
  try {
    const s = url.search('/');
    if (s < 0) {
      return {
        importAppName: url,
        originUrl: '/'
      }
    } else {
      const sUrl = s == 0 ? url.substr(1) : url;
      let ss = sUrl.search('/');
      return {
        importAppName: ss > -1 ? sUrl.substring(0, ss) : sUrl,
        originUrl: ss > -1 ? sUrl.substring(ss) : '/'
      };
    }
  } catch(e){
    throw e
  }

};

export {
  splitUrl
}