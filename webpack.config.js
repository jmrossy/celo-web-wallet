const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SriPlugin = require('webpack-subresource-integrity')
const packageJson = require('./package.json')

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: 'bundle-[name].js',
    crossOriginLoading: 'anonymous', // For SriPlugin
  },
  optimization: {
    splitChunks: {
      minChunks: 3, // Prevents the ledger dyanmic bundle from getting split up into separate vendors + local
    },
  },
  // https://github.com/webpack/webpack-dev-server/issues/2758
  // TODO remove when fixed
  target: isDevelopment ? 'web' : 'browserslist',
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
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    modules: [path.resolve('./node_modules'), path.resolve('./')],
  },
  plugins: [
    // Copy over static files
    new CopyPlugin({
      patterns: [
        { from: './src/_redirects', to: '_redirects', toType: 'file' },
        { from: './static/*', to: 'static/[name].[ext]' },
      ],
    }),
    // Inject some constants into the built code
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version),
      __DEBUG__: isDevelopment,
    }),
    // Inject Subresource Integrity hashes
    new SriPlugin({
      hashFuncNames: ['sha256'],
      enabled: isProduction,
    }),
    // Copy over index.html - doesn't do much but needed for nice SriPlugin integration
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: false,
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
