/**
 * DevTools 入口脚本
 *
 * 在 Chrome DevTools 窗口打开时执行，扫描 moduleRegistry 中
 * actionType 为 'devtools' 的模块，为每个模块创建独立的 DevTools 面板。
 */

import { moduleRegistry } from '@/core'

// 注册所有模块（import 时自动完成）
import '../modules'

/**
 * 为每个已注册的 devtools 模块创建 DevTools 面板
 */
moduleRegistry
  .getModules()
  .filter(m => m.actionType === 'devtools')
  .forEach(m => {
    const icon = 'assets/images/icon.png'
    chrome.devtools.panels.create(m.label, icon, `devtools/panel/index.html?module=${m.name}`)
  })
