import uuid from 'uuid'
import createSecret from '../utils/createSecret'
import promisify from 'q-level'
import levelup from 'levelup'

const db = levelup('./data/db/service', { valueEncoding: 'json' })
const dbPromise = promisify(db)


/**
 * group_list: ['account', 'file']
 * group_file [{appId: 'fdada', socketId, status: 'adfad'}, {...}]
 * socket_jkfdlahgklh23hkhfahdf: {
 *  appId: 'aaa',
 *  appName: 'account',
 *  permission: ['admin'],
 *  socketId: 'ccc'
 * }
 */
export const emptySocket = () => {
  return new Promise(async (resolve, reject) => {
      db.get('group_list', async (err, list) => {
        if (err) {
          try {
            await dbPromise.put('group_list', [])
            resolve()
          } catch(e){
            console.log(e)
            reject(e)
          }
          return false
        }

        try {

          const allAppMetaGroup = await Promise.all(list.map(group => {
            return dbPromise.get(`group_${group}`, {valueEncoding: 'json'})
          }))
          const allAppMeta = allAppMetaGroup.reduce((previous, current) => previous.concat(current), [])
          const allSocketIds = allAppMeta.map(app => app.socketId).filter(val => typeof val == 'string')
          await Promise.all(allSocketIds.map(socketId => dbPromise.del(`socket_${socketId}`)))

          resolve()

        } catch(e){
          if (typeof e == 'string') return reject(e)
          console.log(e.stack||e)
          reject('EMPTY_SOCKET_FAIL')
        }
      })

  })
}

/**
 * delete socket
 */
export const deleteSocket = (socketId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const removed = await dbPromise.del(`socket_${socketId}`)
      // todo remove from group
    } catch(e){
      reject(e)
    }
  })
}

/**
 * 根据socketId获取app信息
 * @param socketId
 * @returns {Promise}
 */
export const getAppBySocketId = (socketId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = await dbPromise.get(`socket_${socketId}`, {valueEncoding: 'json'})
      resolve(socket)
    } catch(e){
      if (typeof e == 'string') return reject(e)
      console.log(e)
      reject('NOT_FOUND')
    }
  })
}


/**
 * getSocketByAppId
 * @param appId
 * @returns {Promise}
 */
export const getSocketByAppId = (appId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const app = await dbPromise.get(`service_${appId}`)
      const group = await dbPromise.get(`group_${app.appName}`)
      const targetAppIndex = group.findIndex(item => item.appId == appId)
      if (targetAppIndex < 0) throw 'APP_NOT_FOUND'
      const socket = await dbPromise.get(`socket_${group[targetAppIndex].socketId}`)
      resolve(socket)
    } catch(e) {
      console.log(e.stack||e)
      reject(e)
    }
  })
}

/**
 * 绑定app到socket
 * @param socketId
 * @param registerInfo
 * @returns {Promise}
 */
export const bindAppToSocket = (socketId, registerInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const app = await dbPromise.get(`service_${registerInfo.appId}`)
      if (app.appSecret != registerInfo.appSecret) throw 'ERROR_REGISTER_INFO'
      const socketData = Object.assign({}, app, {socketId: socketId})
      await dbPromise.put(`socket_${socketId}`, socketData)
      const group = await getGroupUpset(app.appName)
      const targetAppIndex = group.findIndex(item => item.appId == app.appId)
      group[targetAppIndex] = Object.assign({}, group[targetAppIndex], {socketId: socketId, status: 1})
      await dbPromise.put(`group_${app.appName}`, group)
      resolve(socketData)
    } catch(e){
      if (typeof e == 'string') return reject(e)
      console.log(e)
      reject('REGISTER_FAIL')
    }
  })
}

/**
 * 获取处理请求的app, 并作负载均衡
 */
export const getResSocketIdWithBalance = (importAppName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await dbPromise.get(`group_${importAppName}`, {valueEncoding: 'json'})
      console.log(group)
      if (group.length == 0) throw 'TARGET_SERVICE_OFFLINE'
      if (group.length == 1) return resolve(group[0].socketId)
      return resolve(group[0].socketId)

    } catch(e){
      if (typeof e == 'string') return reject(e)
      console.log(e)
      reject('GET_SOCKET_FAIL')
    }
  })
}

/**
 * getGroupUpset
 * @returns {*}
 */
const getGroupUpset = (appName) => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await dbPromise.get(`group_${appName}`))
    } catch(e){
      await dbPromise.put(`group_${appName}`, [], {valueEncoding: 'json'})
      resolve([])
    }
  })
}


/**
 * 新建service
 */
export const createServiceByName = (appName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await getGroupUpset(appName)

      const nextService = {
        appId: uuid.v4(),
        appName: appName,
        appSecret: createSecret()
      }

      group.push({
        appId: nextService.appId,
        socketId: null,
        status: 0,
      })

      await Promise.all([
        dbPromise.put(`group_${appName}`, group, {valueEncoding: 'json'}),
        dbPromise.put(`service_${nextService.appId}`, nextService, {valueEncoding: 'json'})
      ])

      resolve(nextService)
    } catch(e) {
      if (typeof e == 'string') return reject(e)
      console.log(e)
      reject('CREATE_SERVICE_FAIL')
    }
  })
}

/**
 * 导入service
 */
export const importServiceFromConfig = (service) => {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await getGroupUpset(service.appName)
      const index = group.findIndex(item => {
        console.log(item.appId, service.appId)
        return item.appId == service.appId
      })

      if (index > -1) return resolve(group[index])

      const newService = {
        appId: service.appId,
        appName: service.appName,
        appSecret: service.appSecret
      }

      group.push({
        appId: newService.appId,
        socketId: null,
        status: 0,
      })

      await Promise.all([
        dbPromise.put(`group_${service.appName}`, group),
        dbPromise.put(`service_${newService.appId}`, newService)
      ])

      resolve(newService)
    } catch(e) {
      if (typeof e == 'string') return reject(e)
      console.log(e.stack||e)
      reject('CREATE_SERVICE_FAIL')
    }
  })
}