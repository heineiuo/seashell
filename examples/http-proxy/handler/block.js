/**
 * 黑名单域名
 */
const handleBLOCK = (res, host) => new Promise((resolve, reject) => {
  try {
    res.redirect(`https://www.google.com/s?q=${host} is dangerous.`);
    resolve()
  } catch (e) {
    reject(e)
  }
});

export default handleBLOCK;
