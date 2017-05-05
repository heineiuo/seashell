import Joi from 'joi'

export const validate = query => Joi.validate(query, Joi.object().keys({
  socketId: Joi.string().required()
}));

/**
 * delete socket
 */
export default (query) => (dispatch, getCtx) => new Promise(async (resolve, reject) => {
  const validated = validate(query)
  if (validated.error) return reject(validated.error);
  const {socketId} = validated.value;

  // todo
  resolve({})
});
