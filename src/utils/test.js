const argv = {}
process.argv.forEach((val) => {
  if (val.substring(0, 2) == '--'){
    const equalIndex = val.indexOf('=')
    const isBoolTrue = equalIndex < 0
    var value = isBoolTrue ? true: val.substring(equalIndex + 1)
    if (value == 'false') value = false
    if (!isNaN(Number(value))) value = Number(value)
    argv[val.substr(2, isBoolTrue?val.length:equalIndex - 2)] = value
  }
})

console.log(argv)