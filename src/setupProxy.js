const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/graphql",
    createProxyMiddleware({
      target: "https://blue-api.morpho.org",
      changeOrigin: true,
    })
  );
};
