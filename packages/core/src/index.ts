// Channel 类型和基础 API
export { ChannelType, MessageType, Channel } from './base/channel/channel-index'
export type {
  ChannelMessage,
  ChannelOptions,
  Sender,
  ChannelListener
} from './base/channel/channel'

// Channel 实例（各组件侧单例）
export { default as channelBg } from './base/channel/channel-bg'
export { default as channelPopup } from './base/channel/channel-popup'
export { default as channelContent } from './base/channel/channel-content'
export { default as channelOptions } from './base/channel/channel-options'
export { default as channelDevTools } from './base/channel/channel-devtools'
export { createChannel, channel } from './base/channel/channel-index'

// Base 类（门面模式，统一注入所有基础能力）
export { default as Base } from './base'

// 基础能力单例（供需要独立使用 storage/http 的场景）
export { default as storage } from './base/storage'
export { createHttpInstance } from './base/http'

// 模块注册中心
export { moduleRegistry } from './module-registry'
export type { IModule, ModuleMeta, ModuleActionType } from './module-registry'

// 跨世界通信桥
export { bridge } from './cross-world-bridge'

// 核心接口类型
export type {
  ICache,
  IStorage,
  IPopup,
  ITabs,
  IOutput,
  IMessaging,
  IProxyHttp,
  IChannel
} from './interface'
