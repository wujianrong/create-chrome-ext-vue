const path = require('path')
const fs = require('fs')

/**
 * 自动发现所有模块的 standalone 脚本入口。
 * 约定：模块目录下的 standalone/*.ts 文件会被自动发现并作为独立入口打包。
 *
 * 输出路径映射：standalone/{name}.ts → standalone/{module-name}/{name}.js
 * 例如：src/modules/auto-fill-operator/standalone/inject.ts → dist/standalone/auto-fill-operator/inject.js
 */
function discoverStandaloneEntries() {
  const entries = {}
  const srcDir = path.resolve(__dirname, '..')
  const modulesDir = path.join(srcDir, 'src', 'modules')

  if (!fs.existsSync(modulesDir)) {
    return entries
  }

  const moduleNames = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  moduleNames.forEach(moduleName => {
    const standaloneDir = path.join(modulesDir, moduleName, 'standalone')
    if (!fs.existsSync(standaloneDir)) return

    const files = fs.readdirSync(standaloneDir).filter(f => f.endsWith('.ts'))
    files.forEach(file => {
      const basename = file.replace(/\.ts$/, '')
      entries[`standalone/${moduleName}/${basename}`] = path.join(standaloneDir, file)
    })
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
          loader: 'babel-loader'
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
          ]
        }
      }
    ]
  }
}
