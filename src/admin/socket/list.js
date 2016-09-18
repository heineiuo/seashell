import Socket from '../../models/Socket'

/**
 * get all client sockets
 */
module.exports = async (req, res, next) => {
  const list = await Socket.findAll()
  res.json(list)
}
