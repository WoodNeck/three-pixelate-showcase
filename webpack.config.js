const webpack = require("webpack");
const path = require("path");

// http://webpack.github.io/docs/configuration.html
module.exports = {
	entry:{
		main: "./src/App.ts",
	},

	// Outputs compiled bundle to `./web/js/main.js`
	output:{
		path: __dirname + "/web/",
		filename: "js/[name].js"
	},

	resolve: {
		extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
		alias: {
			"@": path.resolve(__dirname, "./src/"),
		},
	},

	module:{
		// Test file extension to run loader
		rules: [
			{
				test: /\.(glsl|vs|fs)$/,
				loader: "ts-shader-loader"
			},
			{
				test: /\.tsx?$/,
				exclude: [/node_modules/, /tsOld/],
				loader: "ts-loader"
			},
			{
        test: /\.csv$/,
        loader: 'raw-loader'
      }
		]
	},

	// Enables dev server to be accessed by computers in local network
	devServer: {
		host: "0.0.0.0",
		port: 8000,
		publicPath: "/web/",
		disableHostCheck: true
	}
}
