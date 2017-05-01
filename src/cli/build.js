import webpack from 'webpack'
import webpackServerConfigCreator from './configure'
import {argv} from 'yargs'
import readConfig from './readConfig'

export default () => {

  const webpackConf = webpackServerConfigCreator(target);
  const compiler = webpack(webpackConf);
  compiler.run((err, stats) => {
    if (err) return console.error(err);
    console.log(`build ${target.outputName} success`)
  });

};
