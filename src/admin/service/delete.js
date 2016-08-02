import * as db from '../../db/db'

/**
 * delete service
 * @param req.body.appId
 * @param res
 * @param next
 */
module.exports = async (req, res, next) => {
  const removed = await db.deleteService(req.body.appId)
  res.json({appId: req.body.appId})
}