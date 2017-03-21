
/**
 * 重定向
 */

const handleREDIRECT = (res, content) => new Promise((resolve, reject) => {
  try {
    res.redirect(content);
    resolve()
  } catch(e){
    reject(e)
  }
});

export default handleREDIRECT
