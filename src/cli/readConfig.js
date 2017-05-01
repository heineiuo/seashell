import fs from 'fs'
import {argv} from 'yargs'

export default () => {

  const configFilename = argv.configFilename || `${process.cwd()}/seashell-dev.json`;
  const config = JSON.parse(fs.readFileSync(configFilename, 'utf-8'));
  return config

};


