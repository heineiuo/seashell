import ent from 'ent'

/**
 * 返回html
 */

const handleHTML = (res, content) => new Promise((resolve, reject) => {
  try {
    res.end(ent.decode(content));
    resolve()
  } catch(e){
    reject(e)
  }
});

export default handleHTML