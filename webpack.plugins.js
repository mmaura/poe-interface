const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, "src", "assets"),
        to: path.resolve(__dirname, ".webpack", "renderer", "assets"),
      },
      {
        from: path.resolve(__dirname, "src", "assets", "AppIcon.png"),
        to: path.resolve(__dirname, ".webpack", "renderer", "assets", "images"),
      },
    ],
  }),
];
