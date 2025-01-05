const TerserPlugin = require('terser-webpack-plugin');
const { mod } = require('three/tsl');

module.exports = {
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin]
    },
    devtool: false,
    devServer: {
        disableHostCheck: true
    },
    resolve: {
        symlinks: true
    }
};