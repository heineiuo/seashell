const createIndex = () => {
  return `
const Hub = require('seashell').Hub
const hub = new Hub()
hub.start()
  `
}

export default createIndex