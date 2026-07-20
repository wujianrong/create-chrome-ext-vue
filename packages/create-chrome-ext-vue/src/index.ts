import { program } from 'commander'
import { join, dirname, relative } from 'path'
import { mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync, existsSync } from 'fs'
import { renderFile } from 'ejs'
import { execSync } from 'child_process'
import { outro, spinner } from '@clack/prompts'
import { askQuestions, ScaffoldOptions } from './questions'

/** 模板包名（npm 依赖解析用） */
const TEMPLATE_PACKAGE = 'create-chrome-ext-vue-template'

interface TemplateOptions {
  name: string
  description: string
  hasSidePanel: boolean
  hasDevTools: boolean
  hasTab: boolean
  hasContentScript: boolean
  hasDemo: boolean
}

/**
 * 解析模板目录路径。
 *
 * 优先级：
 * 1. 命令行 --template 显式指定本地路径
 * 2. npm 依赖包 create-chrome-ext-vue-template（生产环境）
 * 3. monorepo workspace 本地路径（开发环境）
 */
function resolveTemplateDir(customPath?: string): string {
  const candidates: Array<{ label: string; path: string }> = []

  // 1. 用户显式指定的模板路径
  if (customPath) {
    const absPath = join(process.cwd(), customPath)
    candidates.push({ label: '--template 参数', path: absPath })
  }

  // 2. npm 依赖解析
  try {
    const pkgJsonPath = require.resolve(`${TEMPLATE_PACKAGE}/package.json`)
    const dir = dirname(pkgJsonPath)
    candidates.push({ label: `npm 依赖包 ${TEMPLATE_PACKAGE}`, path: dir })
  } catch {
    // 未安装模板包，跳过
  }

  // 3. monorepo 开发环境回退（dist/ → 父目录 → 兄弟目录）
  const devPath = join(__dirname, '..', '..', 'template-vue3')
  candidates.push({ label: '本地开发路径', path: devPath })

  // 按顺序检查，返回第一个存在的路径
  for (const { label, path } of candidates) {
    if (existsSync(path)) {
      // 额外校验：模板目录中应存在关键文件
      const keyFile = join(path, 'package.json')
      if (existsSync(keyFile)) {
        return path
      }
    }
  }

  // 所有路径都不存在，给出明确的错误信息
  const tried = candidates.map((c) => `  - ${c.label}: ${c.path}`).join('\n')
  throw new Error(
    `无法找到模板文件，已尝试以下路径：\n${tried}\n\n` +
      `请确认模板包已安装（npm install ${TEMPLATE_PACKAGE}）或通过 --template 指定自定义模板路径。`
  )
}

/** 根据 TemplateOptions 计算需要跳过的目录（相对于模板根目录的路径） */
function getExcludeDirs(options: TemplateOptions): string[] {
  const excludeDirs: string[] = []
  if (!options.hasDemo) {
    excludeDirs.push(
      'src/modules/demo',
      'src/modules/demo-devtools',
      'src/modules/demo-sidepanel',
      'src/modules/demo-tab'
    )
  } else {
    if (!options.hasDevTools) excludeDirs.push('src/modules/demo-devtools')
    if (!options.hasSidePanel) excludeDirs.push('src/modules/demo-sidepanel')
    if (!options.hasTab) excludeDirs.push('src/modules/demo-tab')
  }
  if (!options.hasSidePanel) excludeDirs.push('src/sidepanel')
  if (!options.hasTab) excludeDirs.push('src/tab-app')
  return excludeDirs
}

/** 递归复制目录，对 .ejs 文件进行渲染，跳过排除列表中的目录 */
async function copyDir(templateDir: string, src: string, dest: string, options: TemplateOptions): Promise<void> {
  const excludeDirs = getExcludeDirs(options)

  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }

  const entries = readdirSync(src)
  for (const entry of entries) {
    const srcPath = join(src, entry)
    const stat = statSync(srcPath)

    if (stat.isDirectory()) {
      // 跳过模板包自己的 package.json 和 node_modules 等不相关目录
      if (entry === 'node_modules' || entry === '.git') continue

      const relPath = relative(templateDir, srcPath).replace(/\\/g, '/')
      if (excludeDirs.includes(relPath)) {
        continue
      }
      await copyDir(templateDir, srcPath, join(dest, entry), options)
      continue
    }

    // 跳过模板包的 package.json（生成的项目自己有 package.json.ejs）
    if (entry === 'package.json' && src === templateDir) continue

    // _gitignore → .gitignore（npm 发布会排除 .gitignore）
    if (entry === '_gitignore') {
      copyFileSync(srcPath, join(dest, '.gitignore'))
      continue
    }

    const ejsMatch = entry.match(/^(.+)\.ejs$/)
    if (ejsMatch) {
      const destPath = join(dest, ejsMatch[1])
      try {
        const content = await renderFile(srcPath, options, {})
        if (content && content.trim()) {
          writeFileSync(destPath, content, 'utf-8')
        }
      } catch (err: any) {
        console.error(`Error rendering ${srcPath}:`, err.message)
        throw err
      }
    } else {
      const destPath = join(dest, entry)
      copyFileSync(srcPath, destPath)
    }
  }
}

/** 安装依赖 */
function installDependencies(projectDir: string, packageManager: string): boolean {
  const installCmd: Record<string, string> = {
    npm: 'npm install',
    yarn: 'yarn',
    pnpm: 'pnpm install'
  }

  if (packageManager === 'skip') return true

  const cmd = installCmd[packageManager]
  if (!cmd) return true

  try {
    execSync(cmd, { cwd: projectDir, stdio: 'inherit' })
    return true
  } catch {
    console.error(`依赖安装失败，请手动在项目目录执行 ${cmd}`)
    return false
  }
}

export async function run(): Promise<void> {
  program
    .name('create-chrome-ext-vue')
    .description('Chrome Extension 开发脚手架（基于 Vue 3 + TypeScript + Webpack）')
    .argument('[project-name]', '项目名称（默认取当前目录名）')
    .option('--template <path>', '自定义模板路径（本地目录或 npm 包名）')
    .action(async (projectName?: string, cmdOpts?: { template?: string }) => {
      const targetDir = projectName ? join(process.cwd(), projectName) : process.cwd()

      if (existsSync(targetDir) && readdirSync(targetDir).length > 0 && projectName) {
        console.error(`目录 "${targetDir}" 不为空，请选择一个空目录或新目录名`)
        process.exit(1)
      }

      const opts = await askQuestions(targetDir)
      if (!opts) {
        process.exit(0)
      }

      const renderSpinner = spinner()
      renderSpinner.start('正在生成项目文件...')

      try {
        const templateDir = resolveTemplateDir(cmdOpts?.template)
        const templateOpts: TemplateOptions = {
          name: opts.name,
          description: opts.description,
          hasSidePanel: opts.hasSidePanel,
          hasDevTools: opts.hasDevTools,
          hasTab: opts.hasTab,
          hasContentScript: opts.hasContentScript,
          hasDemo: opts.hasDemo
        }

        await copyDir(templateDir, templateDir, targetDir, templateOpts)
        renderSpinner.stop('项目文件生成完成')

        // 安装依赖
        if (opts.packageManager !== 'skip') {
          const installSpinner = spinner()
          installSpinner.start(`正在安装依赖（${opts.packageManager}）...`)
          const success = installDependencies(targetDir, opts.packageManager)
          if (success) {
            installSpinner.stop('依赖安装完成')
          } else {
            installSpinner.stop('依赖安装失败')
          }
        }

        const projectDirName = projectName || '.'
        // 输出完成信息
        outro(` 项目创建完成！

  进入项目:
    cd ${projectDirName}

  启动开发:
    npm run dev

  项目结构:
    src/
    ├── popup/           ← Popup UI（Vue 3）
    ├── background/      ← Service Worker
    ├── content-scripts/ ← 注入脚本（ISOLATED + MAIN）
    └── modules/         ← 业务模块目录（在此开发功能）${opts.hasDemo ? `

  已包含 Demo 示例模块，打开浏览器标签页后启动插件即可测试` : ''}
`)
      } catch (err: any) {
        renderSpinner.stop('生成失败')
        console.error('错误:', err.message)
        process.exit(1)
      }
    })

  program.parse()
}
