import Joi from 'joi'

const validate = (query) => Joi.validate(query, Joi.object().keys({
  socketId: Joi.string().required(),
  registerInfo: Joi.object().required(),
}), {allowUnknown: true});

/**
 * *** WARNING ****
 * This bind function is just for dev server, 
 * and it DOESN'T VERIFY REGISTER INFO.
 * You MUST VERIFY REGISTER INFO in production.
 */
export default (query) => (dispatch, getCtx) => new Promise(async(resolve, reject) => {
  const validated = validate(query);
  if (validated.error) return reject(validated.error);
  const {socketId, registerInfo: {appName, appId, appSecret}} = validated.value;

  try {
    const nedb = (await getCtx().getNedb()).collection('socket');
    const doc = await nedb.insert({socketId, appName, appId, appSecret})
    console.log('doc: ' + JSON.stringify(doc))
    if (!doc) return reject(new Error('bind fail'))
    resolve({socketId})
  } catch (e) {
    reject(e);
  }
});
