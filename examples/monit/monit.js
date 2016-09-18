import promisify from 'q-level'
import levelup from 'levelup'

const db = levelup('./data/models/app', { valueEncoding: 'json' })
const dbPromise = promisify(db)


const test1 = async () => {

  try {
    console.log(await dbPromise.get('group-list'))
    console.log(await dbPromise.get('group_admin-client'))
    console.log(await dbPromise.get('group_account'))

  } catch(e){
    console.log(e.stack||e)
  }

}
const test2 = async () => {

  try {
    console.log(await dbPromise.del('group_admin-client'))
    console.log(await dbPromise.del('group_account'))

  } catch(e){
    console.log(e.stack||e)
  }

}


test1()
// test2()
