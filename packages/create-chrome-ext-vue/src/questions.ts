import { text, confirm, multiselect, group, intro, outro, isCancel } from '@clack/prompts'

export interface ScaffoldOptions {
  name: string
  description: string
  hasSidePanel: boolean
  hasDevTools: boolean
  hasTab: boolean
  hasWebview: boolean
  hasContentScript: boolean
  hasDemo: boolean
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'skip'
  targetDir: string
}

export async function askQuestions(targetDir: string): Promise<ScaffoldOptions | null> {
  intro('create-chrome-ext-vue — Chrome Extension 开发脚手架')

  const projectName = await text({
    message: '项目名称',
    placeholder: 'my-chrome-ext',
    defaultValue: targetDir.split(/[/\\]/).pop() || 'my-chrome-ext',
    validate(value: string) {
      if (!value.trim()) return '项目名不能为空'
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) return '项目名只能包含小写字母、数字和连字符'
    }
  })

  if (isCancel(projectName)) {
    outro('已取消')
    return null
  }

  const description = await text({
    message: '项目描述',
    placeholder: 'Chrome Extension powered by Vue 3',
    defaultValue: 'Chrome Extension powered by Vue 3'
  })

  if (isCancel(description)) {
    outro('已取消')
    return null
  }

  const entryResult = await group(
    {
      contentScript: () =>
        confirm({
          message: '启用 Content Script 注入？（含 ISOLATED + MAIN world 双通道）',
          initialValue: true
        }),
      sidePanel: () =>
        confirm({
          message: '启用 Side Panel 侧边栏？',
          initialValue: false
        }),
      devTools: () =>
        confirm({
          message: '启用 DevTools 面板？',
          initialValue: false
        }),
      tab: () =>
        confirm({
          message: '启用 Tab 独立页面？',
          initialValue: false
        }),
      webview: () =>
        confirm({
          message: '启用 Webview 独立页面？',
          initialValue: false
        })
    },
    {
      onCancel() {
        outro('已取消')
      }
    }
  )

  if (!entryResult) {
    outro('已取消')
    return null
  }

  const hasDemo = await confirm({
    message: '是否包含 Demo 示例模块？（展示 Channel + CrossWorldBridge 用法）',
    initialValue: true
  })

  if (isCancel(hasDemo)) {
    outro('已取消')
    return null
  }

  const pkgChoice = await multiselect({
    message: '包管理器',
    options: [
      { value: 'npm', label: 'npm', hint: '推荐' },
      { value: 'yarn', label: 'yarn' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'skip', label: '跳过安装', hint: '我自己装' }
    ],
    required: true
  })

  if (isCancel(pkgChoice) || !pkgChoice) {
    outro('已取消')
    return null
  }

  const pkgManager = (Array.isArray(pkgChoice) ? pkgChoice[0] : pkgChoice) as 'npm' | 'yarn' | 'pnpm' | 'skip'

  return {
    name: (projectName as string).trim(),
    description: (description as string).trim(),
    hasSidePanel: entryResult.sidePanel as boolean,
    hasDevTools: entryResult.devTools as boolean,
    hasTab: entryResult.tab as boolean,
    hasWebview: entryResult.webview as boolean,
    hasContentScript: entryResult.contentScript as boolean,
    hasDemo: hasDemo as boolean,
    packageManager: pkgManager,
    targetDir
  }
}
