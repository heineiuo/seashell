import promisify from 'q-level'
import levelup from 'levelup'

const db = levelup('./data/service', { valueEncoding: 'json' })
const dbPromise = promisify(db)
dbPromise.find = require('../../utils/find')(db)

export default db
export { dbPromise }
