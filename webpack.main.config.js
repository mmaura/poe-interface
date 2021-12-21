const path = require("path")

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/app.ts",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    // extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
    // alias: {
    //   JSON: path.resolve(__dirname, "src/assets/data/"),
    // },
  },
}
