import path from 'path'
import nodeExternals from 'webpack-node-externals'

/**
 * webpack server config
 * @param options
 */
export default (options) => {

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
    }),
    resolve: {
      extensions: ['', '.jsx', '.scss', '.js', '.json'],
      modulesDirectories: [
        'node_modules',
      ]
    },
    module: {
      rules: [
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
