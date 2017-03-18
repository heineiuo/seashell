/**
 * 下载文件
 * @param res
 * @param path (req.query.path)
 */
const downloadHandle = (res, path) => new Promise((resolve, reject) => {
  try {

    if (typeof path == 'undefined') throw new Error('PARAMS_LOST');
    const rawPath = decodeURI(path);
    const result = {path: rawPath};
    const truePath = rawPath;
    res.download(truePath);
    resolve();
  } catch(e){
    reject(e)
  }
});

export default downloadHandle;