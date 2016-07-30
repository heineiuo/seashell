import * as db from '../db/db'

module.exports = async (req, res, next) => {
  const removed = await db.deleteService(req.body.appId)
  res.json({appId: req.body.appId})
}