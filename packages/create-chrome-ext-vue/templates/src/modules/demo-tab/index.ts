/**
 * Demo Tab 示例 —— 独立标签页模块模板
 *
 * Tab 类型的模块通过 chrome.tabs.create() 打开新标签页，
 * 在新标签页中运行完整的 Web 应用。
 */
import type { IModule } from '@chrome-ext-vue/core'

const demoModule: IModule = {
  name: 'demo-tab',
  label: 'Demo Tab',
  icon: 'Monitor',
  description: 'Tab 类型模块示例，展示独立标签页用法',
  category: '示例',
  enabled: true,
  actionType: 'tab',
  route: {
    path: '/demo-tab',
    component: () => import('./TabDemo.vue')
  },
  targetUrl: 'tab-app/index.html#/module/demo-tab'
}

export default demoModule
