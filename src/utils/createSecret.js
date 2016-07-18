const createHash = require('sha.js')
const sha256 = createHash('sha256')

const createSecret = () => {
  return sha256.update(`${Date.now()}${Math.random()}`, 'utf8').digest('hex')
}

export default createSecret