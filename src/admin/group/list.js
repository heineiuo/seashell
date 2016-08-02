import * as db from '../../db/db'

/**
 * List all service types
 * @param req
 * @param res
 * @param next
 */
module.exports = async (req, res, next) => {
  const groupList = await db.getGroupList()
}