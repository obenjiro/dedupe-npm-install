const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')

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
        minimizer: [new TerserPlugin()],

        splitChunks: {
            maxInitialRequests: 30,
            maxAsyncRequests: 30,
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /\/node_modules\/.+\.(js|es6)$/,
                    priority: -10,
                },
                default: {
                    test: /\.(js|es6)$/,
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    plugins: [
        //new BundleAnalyzerPlugin()
    ],
}
