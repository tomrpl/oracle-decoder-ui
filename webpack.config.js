const Dotenv = require("dotenv-webpack");

module.exports = {
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
    },
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
  ],
  // Other Webpack configurations...
};
