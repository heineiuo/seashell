
/**
 * 返回json
 */
const lambdaHandle = async ( res, content, query) => {


  /**
   * example fn
   `
   return new Promise(function (resolve, reject){
      try {
        resolve(Date.now())
      } catch(e){
        reject(e)
      }
    })
   `

   */

  // const lam = await Lambda.findOne({path: req.path})
  // if (!lam) return next()

  const danger = new Function('options', content);

  const response = await danger({
    query: query
  });

  res.json({response: response})


};

export default lambdaHandle;