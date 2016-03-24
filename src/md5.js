const md5 = function (tobeHash) {
  return require('crypto')
    .createHash('md5')
    .update(tobeHash)
    .digest('hex')
}

module.exports = md5