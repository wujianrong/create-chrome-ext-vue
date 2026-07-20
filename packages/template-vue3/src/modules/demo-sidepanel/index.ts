/**
 * Demo SidePanel 示例 —— 侧边栏模块模板
 *
 * SidePanel 类型的模块通过 chrome.sidePanel API 打开，
 * 在浏览器侧边栏中展示内容。
 */
import type { IModule } from '@/core'

const demoModule: IModule = {
  name: 'demo-sidepanel',
  label: 'Demo SidePanel',
  icon: 'Menu',
  description: 'SidePanel 类型模块示例，展示侧边栏用法',
  category: '示例',
  enabled: true,
  actionType: 'sidepanel',
  route: {
    path: '/demo-sidepanel',
    component: () => import('./SidePanelDemo.vue')
  }
}

export default demoModule
