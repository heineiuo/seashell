import {Model} from 'sprucejs'

class Group extends Model {

  /**
   * Group:
   * group_${groupName}:
   *  {
   *
   *  appName: 'account',
   *  permission: ['admin']
   *  list: [
   *   {
   *     appId: 'fdada-gfdh213-123hfkaj-123412',
   *     socketId: '/#fafdg213',
   *     status: 1
   *    }, {...}
   *  ]
   *
   *  }
   */

  Get = (key) => new Promise(async (resolve, reject) => {
    try {
      const result = await this.props.db.get(key);
      resolve(result)
    } catch(e){
      if (e.name == 'NotFoundError') return reject(new Error('GROUP_NOT_FOUND'));
      reject(e)
    }
  });

  Del = (key) => new Promise(async (resolve, reject) => {
    try {
      const result = await this.props.db.del(key);
      resolve(result)
    } catch(e){
      if (e.name == 'NotFoundError') return reject(new Error('GROUP_NOT_FOUND'));
      reject(e)
    }
  });

  Put = (key, value) => new Promise(async (resolve, reject) => {
    try {
      const result = await this.props.db.put(key, value);
      resolve(result)
    } catch(e){
      if (e.name == 'NotFoundError') return reject(new Error('GROUP_NOT_FOUND'));
      reject(e)
    }
  });

  /**
   * get group list
   * @returns {Promise}
   */
  list = () => new Promise(async (resolve, reject) => {
    try {
      const list = await this.props.db.find({});
      resolve(list)
    } catch(e){
      reject(e)
    }
  });

  /**
   * get group detail
   * @returns {Promise}
   */
  detail = (groupName) => new Promise(async (resolve, reject) => {
    const {db} = this.props;

    try {
      const detail = await db.get(groupName);
      resolve(detail)
    } catch(e){
      if (e.name != 'NotFoundError') return reject(e);

      try {
        const detail = {
          appName: groupName,
          permission: [],
          list: []
        };
        await db.put(groupName, detail);
        resolve(detail)
      } catch(e){
        reject(e)
      }

    }
  });


  /**
   * delete a group and all related sockets
   * @param groupName
   * @returns {Promise}
   * @constructor
   */
  remove = (groupName) => new Promise(async (resolve, reject) => {
    try {
      const {db, reducers} = this.props;
      const detail = await db.get(groupName);
      await Promise.all(detail.list.map(item => {
        return new Promise(async (resolve, reject) => {
          if (item.socketId == '') return resolve();
          try {
            await reducers.Socket.remove(item.socketId);
            resolve()
          } catch(e){
            reject(e)
          }
        })
      }));
      await db.del(groupName);
      resolve()
    } catch(e){
      reject(e)
    }
  });


  resolve(query) {
    const {action} = query;
    if (action == 'list') return this.list();
    if (action == 'detail') return this.detail(query);
    if (action == 'remove') return this.remove(query);

    return new Promise((resolve, reject) => reject(new Error('ACTION_NOT_FOUND')))
  }

}

module.exports = Group;