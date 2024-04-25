// Enables TypeScript checks and strict mode for more secure code.
//@ts-check
'use strict';

// Imports necessary Node.js path module for handling file paths.
const path = require('path');

/**
 * Type definition import for Webpack configuration.
 * This helps with autocompletion and type checking for the config object.
 * @typedef {import('webpack').Configuration} WebpackConfig
 */

/** @type WebpackConfig */
const extensionConfig = {
  // Targets a Node.js environment as VS Code extensions run in such a context.
  // More info: https://webpack.js.org/configuration/target/
  target: 'node',

  // Keeps the source code close to the original, useful for debugging.
  // For production, this should be set to 'production'.
  mode: 'none',

  // Entry point for the extension, the starting point of the application.
  // More info: https://webpack.js.org/configuration/entry-context/
  entry: './src/extension.ts',

  output: {
    // Outputs the bundle to the 'dist' folder (refer to package.json).
    // More info: https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },

  // Excludes the 'vscode' module which is provided by the runtime environment.
  // Additional non-webpack'able modules should be listed here.
  // More info: https://webpack.js.org/configuration/externals/
  externals: {
    vscode: 'commonjs vscode',
  },

  resolve: {
    // Adds support for resolving TypeScript and JavaScript files.
    // More info: https://webpack.js.org/configuration/resolve/#resolveextensions
    extensions: ['.ts', '.js', '.svelte'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svelte$/,
        use: ['svelte-loader'],
      },
    ],
  },

  // Generates source maps without source code content, useful for error reporting.
  devtool: 'nosources-source-map',

  // Configures logging level, useful for debugging and development.
  infrastructureLogging: {
    level: "log",
  },
};

// Exports the configuration for use by webpack.
module.exports = [extensionConfig];
