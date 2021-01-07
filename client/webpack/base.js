/* eslint import/no-extraneous-dependencies: "off" */
// import webpack
const webpack = require('webpack');
// Node.js module used to manipulate file paths
const path = require('path');
// generate an HTML file for your application by injecting automatically all
// your generated bundles.
const HtmlWebpackPlugin = require('html-webpack-plugin');
// This plugin will remove all files inside webpack's output.path directory,
// as well as all unused webpack assets after every successful rebuild.
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // the main entry point
  entry: './src/game.ts',

  // The output path
  output: {
    path: path.resolve(__dirname, '../dist'),
  },

  // enable webpack's built-in optimizations
  // that correspond to development
  mode: 'development',
  // Each module is executed with eval() and a SourceMap is added as a DataUrl
  // to the eval(). Initially it is slow, but it provides fast rebuild speed
  // and yields real files
  devtool: 'eval-source-map',

  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    writeToDisk: true,
    port: 8000,
  },

  plugins: [
    new CleanWebpackPlugin({
      // specify the path where this plugin will delete the files on each
      // rebuild
      root: path.resolve(__dirname, './dist'),
    }),
    // config webpack to handle renderer swapping
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      // where your html template is located.
      template: './index.html',
    }),
  ],
  module: {
    rules: [
      {
        // use style loader
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        // checks files with .js or .ts extensions
        test: /\.tsx?$/,
        // exclude node_modules folder
        exclude: /node_modules/,
        // uses babel-loader to transpile your ES6/Typescript code
        use: 'ts-loader',
      },
      {
        test: [/\.vert$/, /\.frag$/],
        // in case you need to use Vertex and Fragment shaders this loader will
        // bundle them for you.
        use: 'raw-loader',
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        // in case you need to use images, this loader will bundle them for
        // you.
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
