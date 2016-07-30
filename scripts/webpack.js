const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const nodeExternals = require('webpack-node-externals')
const argv = {}

const webpackLoaderExclude = (list) => {
  return new RegExp('(node_modules\/)(?!'+list.join('|')+')')
}

const getValue = (equalIndex, val) => {
  var value = val.substring(equalIndex+1)
  return value==''?true:value
}

process.argv.forEach((val, index, array) => {
  if (val.substring(0, 2)=='--'){
    var equalIndex = val.indexOf('=')
    if (equalIndex<0) equalIndex = val.length
    argv[val.substring(2, equalIndex)] = getValue(equalIndex,val)
  }
})

/******************
 *
 * webpack plugins
 *
 ******************/
const uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
  compress: {
    drop_debugger: true,
    dead_code: true,
    // drop_console: true,
    // warnings: false,
    unused: true
  },
  mangle: {
    except: ['window', 'QT','$super', '$', 'exports', 'require']
  }
})

const chunkPlugin = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: Infinity
})

const definePlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production')
})

const DefinePluginProduction = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production')
})

const DefinePluginDevelopment = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('development')
})



/**
 * webpack server config
 */
const webpackServerConfigCreator = (serverName) => {

  const serverConfig = {
    context: process.cwd(),
    // devtool: 'inline-source-map',
    // devtool: 'eval',
    devtool: false,
    target: 'node',
    entry: {
      app: [`${process.cwd()}/src/${serverName}.js`]
    },
    output: {
      libraryTarget: 'commonjs2',
      path: `${process.cwd()}/build`,
      filename: `${serverName}.js`
    },
    externals: nodeExternals({
      //whitelist: [ 'node-uuid', 'sha.js']
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
          exclude: webpackLoaderExclude([]),
          loader: 'babel',
          query: {
            presets:['es2015','stage-0'],
            plugins: ['transform-runtime', "add-module-exports"]
          }
        }
      ]
    },

    plugins: []
  }

  return serverConfig
}




/*******************
 *
 * custom
 *
 *******************/
const webpackClientConfigs = {
}

const allWebpackConfigs = Object.assign({}, webpackClientConfigs, {
  index: webpackServerConfigCreator('index'),
  client: webpackServerConfigCreator('client'),
  cli: webpackServerConfigCreator('cli')
})

console.log(`argv: ${JSON.stringify(argv)}`)

if (argv.build){
  const config = allWebpackConfigs[argv.build]

  if (argv.compress){
    console.log('compress...')
    config.plugins.push(DefinePluginProduction)
    config.plugins.push(uglifyJsPlugin)
  }

  const compiler = webpack(config)

  compiler.run((err, stats)=>{
    if (err) return console.error(err)
    // console.log(stats)
    console.log(`build ${argv.build} success`)
  })
}

