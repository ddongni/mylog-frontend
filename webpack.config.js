const TerserPlugin = require('terser-webpack-plugin');
const { mod } = require('three/tsl');

module.exports = {
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin]
    },
    devtool: false,
    resolve: {
        symlinks: true
    }
};