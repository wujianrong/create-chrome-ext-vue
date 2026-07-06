/**
 * Demo 模块 - MAIN world handler
 *
 * 职责：在 MAIN world 中处理来自 ISOLATED world 的请求，可以：
 *   - 访问页面 DOM
 *   - 访问页面 window 对象上的 JS 变量
 *   - DevTools 可断点调试
 */
import { bridge } from '@chrome-ext-vue/core'

export function registerMainWorldHandlers(): void {
  bridge.on('DEMO_GET_PAGE_TITLE', async () => {
    // 直接读取页面标题（在 MAIN world 中可访问 document）
    const title = document.title

    return {
      title,
      url: window.location.href,
      timestamp: Date.now()
    }
  })
}
