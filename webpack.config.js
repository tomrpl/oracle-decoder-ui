const Dotenv = require("dotenv-webpack");
const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
    },
  },
  plugins: [new Dotenv()],
  // Other Webpack configurations...
};