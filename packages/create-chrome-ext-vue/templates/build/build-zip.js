/**
 * build-all 后处理脚本：将 dist/ 打包为 zip
 *
 * 读取 manifest.json 获取版本号，使用 archiver 将 dist/ 目录
 * 打包为 zip/chrome-高频工具盒+{version}.zip，内部目录名保持相同格式。
 */

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const ZIP_DIR = path.join(ROOT, 'zip')
const MANIFEST_PATH = path.join(ROOT, 'manifest.json')

// 读取 manifest.json 获取版本号
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
const version = manifest.version
const dirName = `chrome-高频工具盒`
const zipName = `${dirName}-${version}.zip`
const zipPath = path.join(ZIP_DIR, zipName)

// 确保 zip 目录存在
if (!fs.existsSync(ZIP_DIR)) {
  fs.mkdirSync(ZIP_DIR, { recursive: true })
}

// 确保 dist 目录存在
if (!fs.existsSync(DIST)) {
  console.error(`错误: dist 目录不存在 (${DIST})`)
  process.exit(1)
}

// 创建 zip
const output = fs.createWriteStream(zipPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
  console.log(`✓ 打包完成: ${zipPath} (${sizeMB} MB)`)
})

archive.on('error', err => {
  console.error('打包失败:', err.message)
  process.exit(1)
})

archive.pipe(output)
// 读取 dist 目录下的所有文件，直接打包到 zip 根目录，不增加一层 dirName 目录
const files = fs.readdirSync(DIST)
files.forEach(file => {
  const filePath = path.join(DIST, file)
  if (fs.statSync(filePath).isFile()) {
    archive.file(filePath, { name: file })
  } else {
    const subFiles = getFiles(filePath)
    subFiles.forEach(subFile => {
      const relativePath = path.relative(DIST, subFile)
      archive.file(subFile, { name: relativePath })
    })
  }
})
archive.finalize()

// 递归获取目录下所有文件
function getFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)
  items.forEach(item => {
    const fullPath = path.join(dir, item)
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  })
  return files
}
