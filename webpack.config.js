const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = {
  mode: 'production',

  entry: {
    x: './src/entry_x.js',
    y: './src/entry_y.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      maxInitialRequests: 30,
      maxAsyncRequests: 30,
      minSize: 0,
      minChunks: 1,
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /\/node_modules\/.+\.(js|es6)$/,
          minChunks: 1,
          minSize: 0,
          priority: -10,
        },
        default: {
          test: /\.(js|es6)$/,
          minChunks: 1,
          minSize: 300,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [new BundleAnalyzerPlugin()],
}
