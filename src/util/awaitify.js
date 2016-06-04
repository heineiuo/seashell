import thunkify from 'thunkify'

const awaitify = function (fn) {
  return async function (){
    const args = Array.prototype.slice.call(arguments,0)
    return new Promise(function (resolve, reject) {
      const thunked = thunkify(fn).apply(this, args)
      thunked(function(err){
        if (err) {
          console.log('[awaitify] err: '+err)
          console.log(err.stack)
          return reject(err)
        }
        resolve.apply(this, Array.prototype.slice.call(arguments, 1))
      })
    })
  }
}

const awaitify2 = function(fn){
  return function(){
    const args = Array.prototype.slice.call(arguments, 0)
    return new Promise(function(resolve, reject){
      const callback = function(err){
        if (err) return reject(err)
        resolve(Array.prototype.slice.call(arguments, 1))
      }
      args.push(callback)
      fn.apply(this, args)
    })
  }
}

export default awaitify
export {awaitify2}