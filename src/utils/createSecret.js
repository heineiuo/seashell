import crypto from 'crypto'

const createSecret = () => {
  return crypto.randomBytes(512)
}

export default createSecret
