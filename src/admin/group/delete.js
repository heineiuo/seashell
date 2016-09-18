import Group from '../../models/Group'

/**
 * delete one group
 * and this will remove all related sockets
 * @param req
 * @param res
 * @param next
 */
module.exports = async (req, res, next) => {
  await Group.delete(req.body.groupName)
  res.json({removed: req.body.groupName})
}
