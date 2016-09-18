import Group from '../../models/Group'

/**
 * List all app types
 * @param req
 * @param res
 * @param next
 */
module.exports = async (req, res, next) => {
  const groupDetail = await Group.detail(req.body.groupId)
  res.json(groupDetail)
}
