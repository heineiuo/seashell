import {homedir} from "os"
import {argv} from "yargs"
import fs from 'fs-promise'
import json5 from 'json5'
import path from 'path'
import nedb from 'nedb-promise'

let config = {};
let configReady = false;
let configError = null;
let leveldb = null;
let isSetup = false;

const getConfig = () => new Promise(async (resolve, reject) => {
  if (configError) return reject(configError);
  if (configReady) return resolve(config);
  try {
    const name = 'seashell-gateway';
    const datadir = argv.datadir ? argv.datadir : `${homedir()}/.seashell-dev-server`;
    try {await fs.mkdir(datadir)} catch(e){};
    const conf = argv.conf ? argv.conf : `${datadir}/config.json`;
    let confContent = {
      port: 3333
    };
    try {
      Object.assign(confContent, json5.parse(await fs.readFile(conf, 'utf8')));
    } catch(e){
      await fs.writeFile(conf, JSON.stringify(confContent), 'utf8');
    }
    delete confContent.conf;
    config = {datadir, ...confContent, ...argv};
    configReady = true;
    resolve(config)
  } catch (e) {
    configError = e;
    reject(configError)
  }
})


const makeSubLevels = (datadir, list) => {
  const collections = {};
  const collection = (subname) => {
    const lowerName = subname.toLowerCase();
    if (collections.hasOwnProperty(lowerName)) return collections[lowerName];
    return nedb({
      filename: `${datadir}/${subname}.db`,
      autoload: true
    })
  }
  list.forEach(name => {
    const lowerName = name.toLowerCase();
    if (['collection'].indexOf(lowerName) > -1) {
      throw new Error('sublevel name could not be {collection}');
    }
    collections[name] = collections[lowerName] = collections.collection(name)
  });

  return {...collections, collection};
};

const setup = () => new Promise(async (resolve, reject) => {
  try {
    const {datadir} = await getConfig();
    leveldb = makeSubLevels(datadir, []);
    isSetup = true;
    resolve(leveldb)
  } catch(e){
    reject(e)
  }
})

export default (options={customError: 'NEDB_DB_CANNOT_ACCESS'}) => new Promise(async (resolve, reject) => {
  if (isSetup) return resolve(leveldb);
  try {
    resolve(await setup())
  } catch(e){
    console.error(e)
    reject(options.customError)
  }
})

export {getConfig}
