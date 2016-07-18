import uuid from 'uuid'
import Datastore from 'nedb-promise'
import createSecret from '../utils/createSecret'

const Service = new Datastore({
  filename: `${process.cwd()}/data/db/Service.db`,
  autoload: true
})

const Schema = {
  // _id: {},
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
 * 列出所有的service
 * @returns {Promise}
 */
Service.listAll = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const list = await Service.find({})
      reject(list)
    } catch(e){
      reject(e)
    }
  })
}

/**
 * 添加服务
 */
Service.createService = (name) => {
  return new Promise(async (resolve, reject) => {
    try {

      const newDoc = await Service.insert({
        appName: name,
        appId: uuid.v4(),
        appSecret: createSecret(),
        online: 0,
        socketId: null
      })

      resolve(newDoc)
    } catch(e){
      reject(e)
    }
  })
}

/**
 * 删除服务
 */
Service.deleteService = (appId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const numRemoved = await Service.remove({appId: appId})
      resolve(numRemoved)
    } catch(e){
      reject(e)
    }
  })
}

/**
 * 更新秘钥
 */
Service.freshSecret = (appId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newDoc = await Service.update({appId: appId}, {
        $set: {
          appSecret: createSecret()
        }
      }, {
        returnUpdatedDocs: true
      })
      resolve(newDoc)
    } catch(e){
      reject(e)
    }
  })
}

export default Service