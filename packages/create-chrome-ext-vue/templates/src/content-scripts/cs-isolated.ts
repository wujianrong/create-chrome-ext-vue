import { moduleRegistry, bridge } from '@/core'
import '../modules/index'

// 初始化跨世界通信桥（ISOLATED 端）
bridge.init(false).then(() => {
  console.log('[cs-isolated] 与 MAIN world 握手完成')
  // 初始化所有模块的 ISOLATED world handler
  moduleRegistry.initContentHandlers()
})
