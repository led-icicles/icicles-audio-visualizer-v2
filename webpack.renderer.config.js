const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    fallback: {
      util: false,
      fs: false,
      path: false,
      buffer: require.resolve("buffer/"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
