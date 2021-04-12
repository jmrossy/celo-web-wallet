const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const packageJson = require('./package.json')

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'
const targetElectron = process.env.BUILD_TARGET === 'electron'

console.log(`Building with webpack. isProduction:${isProduction}, targetElectron:${targetElectron}`)

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: 'bundle-[name].js',
  },
  optimization: {
    splitChunks: {
      minChunks: 3, // Prevents the ledger dyanmic bundle from getting split up into separate vendors + local
    },
  },
  externals: {
    'node-hid': 'commonjs node-hid',
  },
  // https://github.com/webpack/webpack-dev-server/issues/2758
  // TODO remove when fixed, should be in v4 upgrade
  target: targetElectron ? 'electron-renderer' : isDevelopment ? 'web' : 'browserslist',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          {
            loader: 'eslint-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          {
            loader: 'ts-loader',
          },
          {
            loader: 'eslint-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 0,
              modules: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
    ],
  },
  resolve: {
    alias: {
      'src/features/storage/storageProvider$': targetElectron
        ? 'src/features/storage/storageProvider-electron.ts'
        : 'src/features/storage/storageProvider.ts',
      'src/features/ledger/ledgerTransport$': targetElectron
        ? 'src/features/ledger/ledgerTransport-electron.ts'
        : 'src/features/ledger/ledgerTransport.ts',
      'src/app/update$': targetElectron ? 'src/app/update-electron.ts' : 'src/app/update.ts',
    },
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    modules: [path.resolve('./node_modules'), path.resolve('./')],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  plugins: [
    // Copy over static files
    new CopyPlugin(
      targetElectron
        ? {
            patterns: [
              { from: './package-electron.json', to: 'package.json' },
              { from: './src/index.html', to: 'index.html' },
              { from: './electron/main.js', to: 'main.js' },
              { from: './static/*', to: 'static/[name].[ext]' },
            ],
          }
        : {
            patterns: [
              { from: './src/index.html', to: 'index.html' },
              { from: './netlify/*', to: '[name].[ext]' },
              { from: './static/*', to: 'static/[name].[ext]' },
            ],
          }
    ),
    // Inject some constants into the built code
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version),
      __DEBUG__: isDevelopment,
      __IS_ELECTRON__: targetElectron,
    }),
    // Note about react fast refresh: I tried to enable this but it doesn't seem to work with webpack 5 yet.
  ],
  devServer: {
    historyApiFallback: true,
    open: 'Google Chrome',
    hot: true,
  },
  // Show some extra info during build
  stats: {
    assets: true,
    assetsSort: 'size',
    nestedModules: true,
    chunks: true,
    chunkGroups: true,
    chunkModules: true,
    chunkOrigins: true,
    modules: true,
    modulesSort: 'size',
    assetsSpace: 200,
    modulesSpace: 200,
    nestedModulesSpace: 50,
  },
}

module.exports = config
