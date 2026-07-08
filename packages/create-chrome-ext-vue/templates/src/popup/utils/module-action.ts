import type { Router } from 'vue-router'
import type { ModuleMeta } from '@/core'

/** 根据模块的 actionType 分发导航或外部操作 */
export function handleModuleAction(module: ModuleMeta, router: Router): void {
  switch (module.actionType) {
    case 'popup':
      router.push(`/module/${module.name}`)
      break
    case 'tab':
      if (module.targetUrl) {
        chrome.tabs.create({ url: module.targetUrl })
      }
      break
    case 'devtools':
      // 占位：后续实现 devtools 入口逻辑
      console.log(`[ModuleAction] ${module.actionType} 入口：${module.label}`)
      break
    case 'sidepanel':
      // SidePanel 打开逻辑
      // 注意：当前采用简化全局状态方案，使用 chrome.storage.session.currentSidepanelModule 存储模块名称
      // 同一窗口内后打开的 SidePanel 会覆盖先前状态（符合 90% 使用场景：用户一次只关注一个 SidePanel）
      // 如需支持多标签页独立 SidePanel 状态，可升级为 Tab ID + Background 中转方案（见 docs/SIDEPANEL_ARCHITECTURE.md）
      chrome.storage.session.set({ currentSidepanelModule: module.name })
      chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT })
      break
  }
}
