import webpack from 'webpack'
import configure from './configure'
import {argv} from 'yargs'
import path from 'path'
import fs from 'fs-promise'

export default () => {

  process.nextTick(async () => {
    try {

      if (!argv.entry) return console.log('[SEASHELL] Lost param: entry.');
      const entryFile = path.resolve(process.cwd(), argv.entry);
      const pkg = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`));
      const options = {
        ...argv,
        entry: entryFile,
        outputPath: `${process.cwd()}/dist`,
        outputName: pkg.name
      };
      const webpackConf = configure(options);
      const compiler = webpack(webpackConf);
      compiler.run((err, stats) => {
        if (err) return console.error(err);
        console.log(`[SEASHELL] Build ${options.outputName} success`)
      });
      

    } catch(e){
      console.log(e)
    }
  })
  
};
