/**
 * Demo 示例模块 —— 页面标题提取器
 *
 * 完整演示 Channel + CrossWorldBridge 三层通信链路：
 *   Popup (UI) → Channel (Background 路由) → Content Script (ISOLATED)
 *   → CrossWorldBridge (postMessage) → Content Script (MAIN)
 *   → 读取 document.title → 逐级返回
 */
import type { IModule } from '@chrome-ext-vue/core'
import { registerContentHandlers } from './content'
import { registerMainWorldHandlers } from './main-world'

const demoModule: IModule = {
  name: 'demo',
  label: 'Demo 示例',
  icon: 'Document',
  description: '演示 Channel + CrossWorldBridge 三层通信',
  category: '示例',
  enabled: true,
  actionType: 'popup',
  route: {
    path: '/demo',
    component: () => import('./popup.vue')
  },
  registerContentHandlers,
  registerMainWorldHandlers
}

export default demoModule
