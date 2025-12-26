
const path = require('path');
const webpack = require('webpack');

/** @type WebpackConfig */
const config = {
    mode: 'none', // Leave this to the shell script to set
    devtool: 'source-map',
    target: 'node', // Extensions run in Node.js context
    entry: {
        extension: './src/extension.ts' // Entry point
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../../[resource-path]'
    },
    externals: {
        'vscode': 'commonjs vscode', // Ignored because it's provided by the host
    },
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.ts', '.js'], // Support TS resolution
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        // Ignore optional dependencies of robust libraries if any
    ]
};

module.exports = config;
