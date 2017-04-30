
const fs = require('fs');
const build = require('./build');
const dev = require('./dev');
const argv = require('yargs').argv;

module.exports = () => {

  const configFilename = argv.configFilename || `${process.cwd()}/seashell-dev.json`;
  const config = JSON.parse(fs.readFileSync(configFilename, 'utf-8'));

  console.log(`[argv] ${JSON.stringify(argv)}`);

  config.targets.filter(item => !item.disable).forEach(target => {

    if (argv.build) {
      build(target)
    } else {
      dev(target)
    }

  });

};


