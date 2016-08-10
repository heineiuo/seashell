import * as Service from '../../db/db'

/**
 * 显示同一个app group下的实例
 */
module.exports = async (req, res, next) => {
  const list = await Service.getAllAppMeta()
  res.json(list)
}
