import * as db from '../../db/db'

/**
 * create service
 * @param req.body.serviceName 服务名
 * @param res
 * @param next
 */
module.exports = async (req, res, next) => {
  const newService = await db.createServiceByName(req.body.serviceName)
  res.json({service: newService})
}