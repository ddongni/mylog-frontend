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
        host: '0.0.0.0',
        allowedHosts: 'all', // 모든 도메인 허용
    },
    resolve: {
        symlinks: true
    }
};