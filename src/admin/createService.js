import * as db from '../db/db'

module.exports = async (req, res, next) => {
  const newService = await db.createServiceByName(req.body.serviceName)
  res.json({service: newService})
}