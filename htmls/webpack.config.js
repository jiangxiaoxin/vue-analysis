const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "./src/index.js"),
  output: {
    path: path.join(__dirname, "./bundle"),
    filename: "bundle.[hash:6].js"
  },
  module: {
    rules: [
      {
        test:  /\.(png|jpe?g|gif)$/i,
        loader: "file-loader",
        options: {
          name: '[name].[hash:10].[ext]',
          outputPath: 'images'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(
      {
        template: path.resolve(__dirname, "index.html"),
        filename: 'index.[hash:6].html'
      }
    ),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'component.html'),
      filename: 'component.[hash:10].html'
    })
  ]
}