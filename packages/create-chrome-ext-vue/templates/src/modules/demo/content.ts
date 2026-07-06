/**
 * Demo 模块 - ISOLATED world handler
 *
 * 职责：作为薄转发层，监听 Channel 消息并转发给 MAIN world
 */
import { channelContent, bridge } from '@chrome-ext-vue/core'

export function registerContentHandlers(): void {
  // 监听来自 Popup/Background 的 Channel 消息，转发给 MAIN world
  channelContent.on('DEMO_GET_PAGE_TITLE', async (payload) => {
    return bridge.request('DEMO_GET_PAGE_TITLE', payload)
  })
}
