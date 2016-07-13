const createSecret = () => {
  return require('./sha256')(Date.now() + Math.random())
}

module.exports = createSecret