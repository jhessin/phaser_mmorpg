// nodejs path module
const path = require('path');
// For merging this config with base.js
const { merge } = require('webpack-merge');
// To minify your JS file in the build folder
const TerserPlugin = require('terser-webpack-plugin');
// To copy your assets to the build folder
const CopyPlugin = require('copy-webpack-plugin');
// Importing base.js file
const base = require('./base');

module.exports = merge(
  // merging this config with base.js
  base, {
    // enable webpack's built-in optimizations for production
    mode: 'production',
    output: {
      path: path.resolve(__dirname, '../dist'),
      // The name of the built js file
      filename: 'bundle.min.js',
    },
    devtool: false, // We don't need this in our production
    performance: {
      // These configure the file size limit of your build, webpack sends you
      // warnings if it is exceeded.
      maxEntrypointSize: 900000,
      maxAssetSize: 900000,
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              // Tell Terser Plugin to remove comments in your minified file
              comments: false,
            },
          },
        }),
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            // configure the path from where webpack will copy your assets from
            // and the path where it will put it when the build is done, change
            // it according to your app organization
            from: './src/assets',
            to: 'assets',
          },
        ],
      }),
    ],
  },
);
