const resolve = require('path').resolve;
var path = require('path');

module.exports = {
  output: {
    path: path.join(__dirname,'public'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve(__dirname), resolve(__dirname, './src')],
      query: { "presets": ["@babel/react"] }
    }, {
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"]
    }]
  },
  entry:{
    bundle: './src/index.js',
    worker: './worker.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public')
  }
};
