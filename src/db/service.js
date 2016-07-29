const db = require('then-levelup')(require('levelup')('./data/db/service'))


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
 * list group
 * @returns {Promise}
 */
export const listGroup = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const list = await db.get('group-list')
      const detailList = await Promise.all(list.map(getItemDetail))
      resolve(detailList)
    } catch(e){
      reject(e)
    }
  })
}

/**
 * list service from one group
 * @returns {Promise}
 */
export const listService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const list = await db.get('service-list')
      const detailList = await Promise.all(list.map(getItemDetail))
      resolve(detailList)
    } catch(e){
      reject(e)
    }
  })
}

export const getGroupDetail = (serviceId) => {
  return db.get(serviceId)
}

/**
 * get service detail
 * @param serviceId
 * @returns {*}
 */
export const getServiceDetail = (serviceId) => {
  return db.get(`service__${serviceId}`)
}

/**
 * create service
 * @param serviceName
 * @param serviceContent
 * @returns {*}
 */
export const createService = (serviceName, serviceContent) => {
  return db.put(serviceName, serviceContent)
}

/**
 * enable service
 * @param serviceId
 */
export const enableService = (serviceId) => {

}

/**
 * disable service
 * @param serviceId
 */
export const disableService = (serviceId) => {

}

/**
 * get service socket
 *
 * include balance
 */
export const getServiceWithBalance = (serviceName) => {

}



/**
 * 更新秘钥
 */
export const refreshToken = () => {

}

/**
 * 根据socketId获取worker
 */
export const getServiceBySocketId = (socketId) => {
  return db.get(`socket__${socketId}`)
}

