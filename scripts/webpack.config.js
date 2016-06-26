const fs = require('fs')
const path = require('path');
const webpack = require('webpack');
const packageFile = require('../package.json')
const nodeExternals = require('webpack-node-externals')
const _ = require('lodash')

module.exports = {
  context: process.cwd(),
  devtool: false,
  target: 'node',
  entry: {
    app: '../src/index.js'
  },
  output: {
    path: path.join(process.cwd(), '../packages/seashell'),
    libraryTarget: 'commonjs2',
    filename: 'index.js'
  },
  externals: nodeExternals({
    // whitelist: _.keys(packageFile.devDependencies)
  }),
  resolve: {
    extensions: ['', '.jsx', '.scss', '.js', '.json'],
    modulesDirectories: [
      'node_modules',
      path.resolve(process.cwd(), '../node_modules')
    ]
  },
  module: {
    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        // exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: ['es2015','stage-0'],
          plugins: ['transform-runtime', "add-module-exports"]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      }
    })
  ]
}