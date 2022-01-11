import webpack from 'webpack'
import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
const ENV = process.env.NODE_ENV || 'development'

const developmentPlugins = [
  // When using webpack-dev-server we want to be able to access
  // `src/accessible-autocomplete.css` at `dist/accessible-autocomplete.min.css`.
  // Using `copy-webpack-plugin` is the easiest way to do this; note that when
  // used with webpack-dev-server no files are actually made, the copy just
  // happens in memory.
  new CopyWebpackPlugin([
    { from: './autocomplete.css', to: 'accessible-autocomplete.min.css' }
  ])
]

const config = {
  context: path.resolve(__dirname, 'src'),

  optimization: {
    minimize: ENV === 'production',
    minimizer: [new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: true,
      uglifyOptions: {
        compress: {
          negate_iife: false,
          properties: false,
          ie8: true
        },
        mangle: {
          ie8: true
        },
        output: {
          comments: false,
          ie8: true
        }
      }
    })],
    noEmitOnErrors: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },

  mode: ENV === 'production' ? 'production' : 'development',
  devtool: ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    publicPath: '/dist/',
    contentBase: './examples',
    historyApiFallback: true,
    open: true,
    watchContentBase: true,
    disableHostCheck: true
  }
}

const bundleStandalone = {
  ...config,
  name: 'standalone',
  entry: './wrapper.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'accessible-autocomplete.min.js',
    library: 'accessibleAutocomplete',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.COMPONENT_LIBRARY': '"PREACT"'
    })
  ]
    .concat(ENV === 'development'
      ? developmentPlugins
      : []
    )
}

const bundlePreact = {
  ...config,
  name: 'preact',
  entry: './autocomplete.js',
  output: {
    path: path.resolve(__dirname, 'dist', 'lib'),
    filename: 'accessible-autocomplete.preact.min.js',
    library: 'Autocomplete',
    libraryTarget: 'umd'
  },
  externals: {
    preact: {
      amd: 'preact',
      commonjs: 'preact',
      commonjs2: 'preact',
      root: 'preact'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.COMPONENT_LIBRARY': '"PREACT"'
    })
  ]
    .concat(ENV === 'development'
      ? developmentPlugins
      : []
    )
}

const bundleReact = {
  ...config,
  name: 'react',
  entry: './autocomplete.js',
  output: {
    path: path.resolve(__dirname, 'dist', 'lib'),
    filename: 'accessible-autocomplete.react.min.js',
    library: 'Autocomplete',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  externals: {
    // This is not a typo! We call the external `preact` even though we are
    // using `react`, so that in the source file we can write `import 'preact'`
    // and have it return either module as appropriate.
    preact: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.COMPONENT_LIBRARY': '"REACT"'
    })
  ]
    .concat(ENV === 'development'
      ? developmentPlugins
      : []
    )
}

module.exports = [
  bundleStandalone,
  bundlePreact,
  bundleReact
]
