const argv = {}

const getValue = (equalIndex, val) => {
  var value = val.substring(equalIndex+1)
  return value==''?true:value
}

process.argv.forEach((val, index, array) => {
  if (val.substring(0, 2)=='--'){
    var equalIndex = val.indexOf('=')
    if (equalIndex<0) equalIndex = val.length
    argv[val.substring(2, equalIndex)] = getValue(equalIndex,val)
  }
})

module.exports = argv