const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' }, 
    { 
      loader: 'css-loader',
      options: {
        importLoaders: 1
      }
    },
    { loader: 'postcss-loader' }
  ],
}
);

module.exports = {
  watchOptions: {
    ignored:  /.*\.json/ 
  },

  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
