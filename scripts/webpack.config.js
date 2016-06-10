const fs = require('fs')
const path = require('path');
const webpack = require('webpack');
const packageFile = require('../package.json')
const nodeExternals = require('webpack-node-externals')
const _ = require('lodash')

module.exports = {
  context: __dirname,
  //, devtool: 'inline-source-map'
  //, devtool: 'eval'
  devtool: false,
  target: 'node',
  entry: {
    app: '../src/index.js'
  },
  output: {
    path: path.join(__dirname, '../packages/seashell'),
    //filename: '[name].js'
    libraryTarget: 'commonjs2',
    filename: 'index.js'
  },
  externals: nodeExternals({
    whitelist: _.keys(packageFile.devDependencies)
  }),
  resolve: {
    extensions: ['', '.jsx', '.scss', '.js', '.json']
    , modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, '../node_modules')
    ]
  }
  , module: {
    loaders: [
      {
        test: /(\.js|\.jsx)$/
        // , exclude: /(node_modules)/
        , loader: 'babel'
        , query: {
        presets:['es2015','stage-0']
        ,plugins: ['transform-runtime', "add-module-exports"]
      }
      }
    ]
  }
  , plugins: [
    //new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      //'process.env.NODE_ENV': JSON.stringify('production')
      'process.env.NODE_ENV': JSON.stringify('production')
    })
    , new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      }
    })
  ]
}