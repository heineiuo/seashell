const path = require('path');
const nodeExternals = require('webpack-node-externals');

/**
 * webpack server config
 * @param options
 */
module.exports = (options) => {

  const config = {
    context: process.cwd(),
    // devtool: 'inline-source-map',
    // devtool: 'eval',
    devtool: false,
    target: 'node',
    entry: {
      index: [path.join(process.cwd(), options.entry)]
    },
    output: {
      path: path.join(process.cwd(), options.outputPath),
      filename: `${options.outputName}.js`
    },
    externals: nodeExternals({
      // whitelist: [ 'node-uuid', 'sha.js']
      // whitelist: _.keys(packageFile.devDependencies)
    }),
    resolve: {
      extensions: ['', '.jsx', '.scss', '.js', '.json'],
      modulesDirectories: [
        'node_modules',
      ]
    },
    module: {
      loaders: [
        {
          test: /(\.js|\.jsx)$/,
          exclude: /(node_modules)/,
          loader: 'babel',
          query: {
            presets:['es2015','stage-0', 'react'],
            plugins: ['transform-runtime']
          }
        }
      ]
    },

    plugins: []
  };

  return config

};