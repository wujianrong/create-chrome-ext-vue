export { ChannelType, MessageType } from './channel'
export type { ChannelMessage, ChannelOptions, Sender, ChannelListener } from './channel'
export { Channel } from './channel-core'

export { default as channelBg } from './channel-bg'
export { default as channelPopup } from './channel-popup'
export { default as channelContent } from './channel-content'
export { default as channelOptions } from './channel-options'
export { default as channelDevTools } from './channel-devtools'

import channelBg from './channel-bg'
import channelPopup from './channel-popup'
import channelContent from './channel-content'
import channelOptions from './channel-options'
import channelDevTools from './channel-devtools'
import { ChannelType } from './channel'

export function createChannel(type: ChannelType) {
  switch (type) {
    case ChannelType.BACKGROUND:
      return channelBg
    case ChannelType.POPUP:
      return channelPopup
    case ChannelType.CONTENT:
      return channelContent
    case ChannelType.OPTIONS:
      return channelOptions
    case ChannelType.DEVTOOLS:
      return channelDevTools
    default:
      throw new Error(`Unknown channel type: ${type}`)
  }
}

export const channel = {
  background: channelBg,
  popup: channelPopup,
  content: channelContent,
  options: channelOptions,
  devtools: channelDevTools
}

export default channel
