const db = require('then-levelup')(require('levelup')('./data/db/socket'))


/**
 * db.put(`service-group__${groupName}`)
 */
const serviceGroupSchema = {

}

/**
 * db.put(`service__${appId}`)
 */
const serviceSchema = {
  appId: {
    type: String
  },
  appName: {
    type: String
  },
  appSecret: {
    type: String
  },
  socketId: {
    type: String, // example: /#VDjLAYvKoFbHv5hSAAAE
  },
  online: {
    type: Number
  }
}

/**
 * db.put(`socket__${socketId}`)
 */
const socketSchema = {
  socketId: '',
  appId: ''
}


/**
 * empty socket
 * @returns {Promise}
 */
export const emptySocket = (socketId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const list = await db.get('socketList')
      const deleteTasks = list.map(deleteSocket)
      await Promise.all(deleteTasks)
      resolve({numRemoved: deleteTasks.length})
    } catch(e){
      reject(e)
    }
  })
}

/**
 * del socket
 * @returns {Promise}
 */
export const deleteSocket = (socketId) => {
  return db.del(socketId)
}
