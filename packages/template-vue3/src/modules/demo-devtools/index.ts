/**
 * Demo DevTools 示例 —— 开发者工具面板模板
 *
 * DevTools 类型的模块通过 devtools/index.ts 入口脚本
 * 调用 chrome.devtools.panels.create() 创建独立面板。
 * 面板页面 devtools/panel/App.vue 根据 URL 参数动态加载模块组件。
 */
import type { IModule } from '@/core'

const demoModule: IModule = {
  name: 'demo-devtools',
  label: 'Demo DevTools',
  icon: 'Setting',
  description: 'DevTools 类型模块示例，展示当前页面和扩展信息',
  category: '示例',
  enabled: true,
  actionType: 'devtools',
  route: {
    path: '/demo-devtools',
    component: () => import('./DemoDevTools.vue')
  },
  targetUrl: 'devtools/panel/index.html?module=demo-devtools'
}

export default demoModule
