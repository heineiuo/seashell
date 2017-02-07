import {Model} from 'sprucejs'

class Socket extends Model {

  /**
   * Socket
   * socket_${socketId}:
   *  {
   *   appId: 'aaa-fag-gafd123f-g123123-fda-123',
   *   appName: 'account',
   *   permission: ['admin'],
   *   socketId: 'ccc'
   *  }
   *
   */


  /**
   * empty all sockets records
   * @returns {Promise}
   */
  empty = () => new Promise(async (resolve, reject) => {
    try {
      const {db, reducers} = this.props;
      const sockets = await this.findAll();
      await Promise.all(sockets.map(item => db.del(item._key)));
      const groups = await reducers.Group.list();
      await Promise.all(groups.map(group => {
        group.list = group.list.map(item => ({
          appId: item.appId,
          socketId: "",
          status: 0
        }));
        return reducers.Group.Put(group._key, group)
      }));
      resolve()
    } catch(e){
      reject(e);
    }
  });

  findAll = () => new Promise(async (resolve, reject) => {
    try {
      const {db} = this.props;
      const list = await db.find({});
      resolve({list})
    } catch(e){
      reject(e)
    }
  });


  /**
   * delete socket
   */
  remove = (query) => new Promise(async (resolve, reject) => {
    try {
      const {socketId} = query;
      const {db, reducers} = this.props;
      const socketInfo = await db.get(socketId);
      await db.del(socketId);
      const group = await reducers.Group.Get(socketInfo.appName);
      group.list = group.list.map(item => {
        if (item.appId == socketInfo.appId) {
          item.socketId = '';
          item.status = 0
        }
        return item
      });
      await reducers.Group.Put(socketInfo.appName, group);
      resolve(1)
    } catch(e){
      reject(e)
    }
  });

  /**
   * 根据socketId获取app信息
   * @param query.socketId
   * @returns {Promise}
   */
  detail = (query) => new Promise(async (resolve, reject) => {
    try {
      const {socketId} = query;
      const {db} = this.props;
      const socket = await db.get(socketId, {valueEncoding: 'json'});
      resolve(socket)
    } catch(e){
      if (e.name == 'NotFoundError') return reject(new Error('SOCKET_NOT_FOUND'));
      reject(e)
    }
  });



  /**
   * get socket by appId
   * @param query.appId
   * @returns {Promise}
   */
  findByAppId = (query) => new Promise(async (resolve, reject) => {
    try {
      const {appId} = query;
      const {db, reducers} = this.props;
      const app = await reducers.App.Get(appId);
      const group = await reducers.Group.Get(app.appName);
      const targetAppIndex = group.list.findIndex(item => item.appId == appId);
      if (targetAppIndex < 0) throw new Error('APP_NOT_FOUND');
      const socket = await db.get(group.list[targetAppIndex].socketId);
      resolve(socket)
    } catch(e) {
      reject(e)
    }
  });

  /**
   * 绑定app到socket
   * @param query.socketId
   * @param query.registerInfo
   * @returns {Promise}
   */
  bindApp = (query) => new Promise(async (resolve, reject) => {
    try {
      const {socketId, registerInfo} = query;
      const {db, reducers} = this.props;
      const app = await reducers.App.Get(registerInfo.appId);
      if (app.appSecret != registerInfo.appSecret) throw new Error('ERROR_REGISTER_INFO');
      const socketData = Object.assign({}, app, {socketId: socketId});
      await db.put(socketId, socketData);
      const group = await reducers.Group.detail(app.appName);
      const targetAppIndex = group.list.findIndex(item => item.appId == app.appId);
      group.list[targetAppIndex] = Object.assign(
        {},
        group.list[targetAppIndex],
        {socketId: socketId, status: 1}
      );
      await reducers.Group.Put(app.appName, group);
      resolve(socketData)
    } catch(e){
      reject(e);
    }
  });

  /**
   * 获取处理请求的app, 并作负载均衡
   */
  balance = (query) => new Promise(async (resolve, reject) => {
    try {
      const {importAppName} = query;
      const {db, reducers} = this.props;
      const group = await reducers.Group.Get(importAppName, {valueEncoding: 'json'});
      const onlineItems = group.list.filter(service => service.status == 1);
      if (onlineItems.length == 0) throw new Error('TARGET_SERVICE_OFFLINE');
      if (onlineItems.length == 1) return resolve(onlineItems[0].socketId);
      const ts = String(Date.now());
      const randomNumber = Number(ts[ts.length - 1]);
      const randomIndex = Math.floor(randomNumber * onlineItems.length / 10);
      return resolve(group[randomIndex].socketId)
    } catch(e){
      reject(e);
    }
  });

  resolve(query) {
    const {action} = query;
    if (action == 'balance') return this.balance(query);
    if (action == 'bindApp') return this.bindApp(query);
    if (action == 'findByAppId') return this.findByAppId(query);
    if (action == 'detail') return this.detail(query);
    if (action == 'remove') return this.remove(query);
    if (action == 'findAll') return this.findAll(query);
    if (action == 'empty') return this.empty();

    return new Promise((resolve, reject) => reject(new Error('ACTION_NOT_FOUND')))
  }


}

module.exports = Socket;