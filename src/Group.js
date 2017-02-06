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


  /**
   * get group list
   * @returns {Promise}
   */
  list = () => new Promise(async (resolve, reject) => {
    try {
      const list = await Group.find({prefix: 'group_'});
      resolve(list)
    } catch(e){
      if (typeof e == 'string') return reject(e);
      console.log(e);
      reject('NOT_FOUND')
    }
  });

  /**
   * get group detail
   * @returns {Promise}
   */
  detail = (groupName) => new Promise(async (resolve, reject) => {
    const {db} = this.props;

    try {
      const detail = await db.get(`group_${groupName}`);
      resolve(detail)
    } catch(e){
      if (e.name != 'NotFoundError') return reject(e);

      try {
        const detail = {
          appName: groupName,
          permission: [],
          list: []
        };
        await db.put(`group_${groupName}`, detail);
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
  delete = (groupName) => new Promise(async (resolve, reject) => {
    try {
      const detail = await Group.get(`group_${groupName}`);
      await Promise.all(detail.list.map(item => {
        return new Promise(async (resolve, reject) => {
          if (item.socketId == '') return resolve();
          try {
            await Group.del(`socket_${item.socketId}`);
            resolve()
          } catch(e){
            reject(e)
          }
        })
      }));
      await Group.del(`group_${groupName}`);
      resolve()
    } catch(e){
      if (typeof e == 'string') return reject(e);
      console.log(e);
      reject('NOT_FOUND')
    }
  });


  resolve(query) {
    const {action} = query;
    if (action == 'list') return this.list();
    if (action == 'detail') return this.detail(query);
    if (action == 'delete') return this.delete(query);

    return new Promise((resolve, reject) => reject(new Error('ACTION_NOT_FOUND')))
  }

}

module.exports = Group;