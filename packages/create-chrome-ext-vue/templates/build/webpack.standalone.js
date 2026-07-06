const path = require('path')
const glob = require('glob')

/**
 * 自动发现所有模块的 standalone 脚本入口。
 * 约定：模块目录下的 standalone/**\/*.ts 文件会被自动发现并作为独立入口打包。
 *
 * 输出路径映射：standalone/{name}.ts → standalone/{module-name}/{name}.js
 * 例如：src/modules/auto-fill-operator/standalone/inject.ts → dist/standalone/auto-fill-operator/inject.js
 */
function discoverStandaloneEntries() {
  const entries = {}
  const files = glob.sync('src/modules/**/standalone/*.ts', { cwd: path.resolve(__dirname, '..'), absolute: true })

  files.forEach(filePath => {
    const basename = path.basename(filePath, '.ts')
    const moduleName = path.basename(path.dirname(path.dirname(filePath)))
    entries[`standalone/${moduleName}/${basename}`] = filePath
  })

  return entries
}

module.exports = {
  entry: discoverStandaloneEntries(),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['lodash']
          }
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            [
              '@babel/preset-typescript',
              { allExtensions: true }
            ]
          ],
          plugins: ['lodash']
        }
      }
    ]
  }
}
