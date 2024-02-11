const path = require('path');

module.exports = {
  entry: './ipfs.js',
  mode : 'development',
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'bundle.js',
  },
};