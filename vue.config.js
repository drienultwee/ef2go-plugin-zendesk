module.exports = {
    devServer: {
        https: true,
        disableHostCheck: true
    },
    chainWebpack: config => {
        config.optimization.splitChunks(false);
    }
}
