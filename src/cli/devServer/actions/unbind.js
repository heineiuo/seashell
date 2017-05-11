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
  try {
    const nedb = (await getCtx().getNedb()).collection('socket');
    const numRemoved = await nedb.remove({socketId});
    resolve({numRemoved})
  } catch(e){
    reject(e)
  }

});
