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
    crossOriginLoading: 'anonymous',
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
    new CopyPlugin({
      patterns: [
        { from: './src/_redirects', to: '_redirects', toType: 'file' },
        { from: './static/*', to: 'static/[name].[ext]' },
      ],
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version),
      __DEBUG__: isDevelopment,
    }),
    new SriPlugin({
      hashFuncNames: ['sha256'],
      enabled: isProduction,
    }),
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
}

module.exports = config
