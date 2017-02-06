import uuid from 'uuid'
import {Model} from 'sprucejs'
import crypto from 'crypto'

const createSecret = () => crypto.randomBytes(512);


class App extends Model {

  /**
   * App:
   *
   * app_${appId}:
   *
   * {
   *  appId: '',
   *  appName: '',
   *  appSecret: ''
   * }
   *
   */

  schema = {
    appId: String,
    appName: String,
    appSecret: String
  };

  /**
   * app create
   */
  create = (appName) => new Promise(async (resolve, reject) => {
    try {
      const {db, reducers} = this.props;
      const nextService = {
        appId: uuid.v4(),
        appName: appName,
        appSecret: createSecret()
      };

      const group = await reducers.Group.detail(appName);
      group.list.push({
        appId: nextService.appId,
        socketId: '',
        status: 0,
      });

      await Promise.all([
        db.put(`group_${appName}`, group, {valueEncoding: 'json'}),
        db.put(`app_${nextService.appId}`, nextService, {valueEncoding: 'json'})
      ]);

      resolve(nextService)
    } catch(e) {
      reject(new Error('CREATE_SERVICE_FAIL'))
    }
  });

  /**
   * 导入service
   */
  importFromConfig = (service) => new Promise(async (resolve, reject) => {
    const {db, reducers} = this.props;

    try {
      const group = await reducers.Group.detail(service.appName);
      const index = group.list.findIndex(item => {
        console.log(item.appId, service.appId);
        return item.appId == service.appId
      });

      if (index > -1) return resolve(group.list[index]);

      const newService = {
        appId: service.appId,
        appName: service.appName,
        appSecret: service.appSecret
      };

      group.list.push({
        appId: newService.appId,
        socketId: null,
        status: 0,
      });

      await Promise.all([
        db.put(`group_${service.appName}`, group),
        db.put(`app_${newService.appId}`, newService)
      ]);

      resolve(newService)
    } catch(e) {
      reject(new Error('CREATE_SERVICE_FAIL'))
    }
  });

  resolve(query) {
    const {action} = query;
    if (action == 'create') return this.create(query);
    if (action == 'importFromConfig') return this.importFromConfig(query);
    return new Promise((resolve, reject) => reject(new Error('ACTION_NOT_FOUND')))

  }

}

module.exports = App;