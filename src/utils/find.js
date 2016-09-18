module.exports = (db) => {
  return (query={}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const option = {
          keys: true,
          values: true,
          revers: false,
          limit: 20,
          fillCache: true
        }

        if (query.prefix) {
          option.start = query.prefix
          option.end = query.prefix.substring(0, query.prefix.length - 1)
            + String.fromCharCode(query.prefix[query.prefix.length - 1].charCodeAt() + 1)
        }

        if (query.limit) {
          option.limit = query.limit
        }

        const result = []
        db.createReadStream(option).on('data', function (data) {
          result.push(data)
        }).on('error',function (err) {
          reject(err)
        }).on('close',function () {
          // console.log('close')
        }).on('end', function () {
          resolve(result)
        })

      } catch(e) {
        reject(e)
      }
    })
  }
}

