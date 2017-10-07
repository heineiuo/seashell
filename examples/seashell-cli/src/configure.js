import path from 'path'
import nodeExternals from 'webpack-node-externals'

/**
 * webpack server config
 * @param options.entry
 * @param options.outputPath
 * @param options.outputName
 */
export default (options) => {

  const config = {
    context: process.cwd(),
    // devtool: 'inline-source-map',
    // devtool: 'eval',
    devtool: false,
    target: 'node',
    entry: {
      index: [options.entry]
    },
    output: {
      path: options.outputPath,
      filename: `${options.outputName}.js`
    },
    externals: nodeExternals({}),
    resolve: {
      extensions: ['.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /(\.js|\.jsx)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader'
        }
      ]
    },

    plugins: []
  };

  return config

};
