const path = require("path");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/app.ts",
  // Put your normal webpack config below here
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   assetModuleFilename: "images/[hash][ext][query]",
  // },
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    alias: {
      JSON: path.resolve(__dirname, "src/assets/data/"),
    },
  },
};

// module.exports = {
//   entry: "./src/AppIcon.png",
//   output: {
//     path: path.resolve(__dirname, "renderer", "resources"),
//   },
//   module: {
//     rules: [
//       {
//         test: /AppIcon\.(png|jpg|svg|jpeg|gif)$/,
//         type: "asset/resource",
//         generator: {
//           filename: ".[hash][ext][query]",
//           publicPath: "",
//         },
//       },
//     ],
//   },
// };

// rules.push({
//   test: /AppIcon\.png$/,
//   type: "asset/resource",
//   generator: {
//     filename: "AppIcon.png",
//     publicPath: "./resources/",
//   },
//   // use: [
//   //   {
//   //     loader: 'file-loader',
//   //     options: {
//   //       publicPath: "../renderer/.",
//   //     },
//   //   },
//   // ],
//   //   use: [
//   //     {
//   //         //loader: 'file-loader',
//   //         options: {
//   //             name: '[name].[ext]',
//   //             publicPath: '../.'
//   //             publicPath: '../renderer/.'
//   //         }
//   //     },
//   // ],
// });
