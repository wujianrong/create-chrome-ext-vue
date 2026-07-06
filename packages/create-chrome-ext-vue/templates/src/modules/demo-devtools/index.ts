/**
 * Demo DevTools 示例 —— 开发者工具面板模板
 *
 * DevTools 类型的模块作为 Chrome DevTools 面板运行。
 * 注意：完整实现需要在 manifest.json 中配置 devtools_page，
 * 并在 devtools.html 中通过 chrome.devtools.panels.create() 创建面板。
 *
 * 此模板展示了模块定义结构，实际 DevTools 入口需要额外配置。
 */
import type { IModule } from '@chrome-ext-vue/core'

const demoModule: IModule = {
  name: 'demo-devtools',
  label: 'Demo DevTools',
  icon: 'Setting',
  description: 'DevTools 类型模块示例，展示 DevTools 面板配置',
  category: '示例',
  enabled: true,
  actionType: 'devtools'
  // DevTools 入口需要：
  // 1. manifest.json 中添加 devtools_page: "devtools/index.html"
  // 2. devtools/index.html 中加载 devtools.js
  // 3. devtools.js 中调用 chrome.devtools.panels.create()
}

export default demoModule
