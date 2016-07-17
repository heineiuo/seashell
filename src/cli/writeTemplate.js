
function init(program) {
  console.log('Start init...')
  fs.copy(path.join(__dirname, '../template'), process.cwd(), function (err) {
    if (err) throw (err)
    console.log('Init success')
  })
}

module.exports = init