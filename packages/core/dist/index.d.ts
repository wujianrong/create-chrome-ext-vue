export { ChannelType, MessageType, Channel } from './base/channel/channel-index';
export type { ChannelMessage, ChannelOptions, Sender, ChannelListener } from './base/channel/channel';
export { default as channelBg } from './base/channel/channel-bg';
export { default as channelPopup } from './base/channel/channel-popup';
export { default as channelContent } from './base/channel/channel-content';
export { default as channelOptions } from './base/channel/channel-options';
export { default as channelDevTools } from './base/channel/channel-devtools';
export { createChannel, channel } from './base/channel/channel-index';
export { default as Base } from './base';
export { default as storage } from './base/storage';
export { createHttpInstance } from './base/http';
export { moduleRegistry } from './module-registry';
export type { IModule, ModuleMeta, ModuleActionType } from './module-registry';
export { bridge } from './cross-world-bridge';
export type { ICache, IStorage, IPopup, ITabs, IOutput, IMessaging, IProxyHttp, IChannel } from './interface';
//# sourceMappingURL=index.d.ts.map