const { merge } = require('webpack-merge')
const base = require('./webpack.base.js')

module.exports = merge(base, {
  mode: 'production',
  devtool: 'inline-source-map' // 即使在开发环境也使用更安全的source map类型
})
