// const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  output: {
    filename: "./bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          // "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "less-loader", // compiles Less to CSS
        ],
      },
      {
        test: /\.css$/,
        loader: "file-loader",
        options: {
          name: "css/[name].[ext]",
        },
      },
      {
        test: /\.(png|gif|svg|jpg)$/,
        loader: "file-loader",
        options: {
          name: "img/[name].[ext]",
        },
      },
      {
        test: /(plugins|modernizr-3.11.2.min)\.js/,
        loader: "file-loader",
        options: {
          name: "js/vendor/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "N2 Prep",
      template: "index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
