const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const WatchIgnorePlugin = require("webpack").WatchIgnorePlugin

const path = require("path")

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  //dont work https://github.com/gatsbyjs/gatsby/issues/33216
  //   new WatchIgnorePlugin([
  //   path.resolve(__dirname, "src", "assets", "data"),
  //   path.resolve(__dirname, "src", "assets", "classguides")
  // ]),
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
]
