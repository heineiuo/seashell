const webpackServerConfigCreator = require('./configure');
const webpack = require('webpack');

module.exports = (target) => {

  const webpackConf = webpackServerConfigCreator(target);
  const compiler = webpack(webpackConf);
  compiler.run((err, stats) => {
    if (err) return console.error(err);
    console.log(`build ${target.outputName} success`)
  });

};