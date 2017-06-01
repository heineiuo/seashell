import Joi from 'joi'

export const validate = query => Joi.validate(query, Joi.object().keys({
  appId: Joi.string(),
  appName: Joi.string().required(),
}), {allowUnknown: true})

export default query => (dispatch, getCtx) => new Promise(async (resolve, reject) => {
  const validated = validate(query);
  const {appName, appId} = validated.value;
  let socketId = null;
  try {
    const nedb = (await getCtx().getNedb()).collection('socket');
    const doc = await nedb.findOne({appName});
    console.log('doc: ' + JSON.stringify(doc));
    if (!doc) return reject('NOT_FOUND')
    resolve({socketId: doc.socketId});
  } catch(e){
    reject(e)
  }
})
