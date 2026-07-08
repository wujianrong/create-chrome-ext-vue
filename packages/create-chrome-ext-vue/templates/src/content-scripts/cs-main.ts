import { moduleRegistry, bridge } from '@/core'
import '../modules/index'

// 初始化跨世界通信桥（MAIN 端）
bridge.init(true).then(() => {
  console.log('[cs-main] 与 ISOLATED world 握手完成')
  // 初始化所有模块的 MAIN world handler
  moduleRegistry.initMainWorldHandlers()
})
