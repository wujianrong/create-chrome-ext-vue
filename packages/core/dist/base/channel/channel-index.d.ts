export { ChannelType, MessageType } from './channel';
export type { ChannelMessage, ChannelOptions, Sender, ChannelListener } from './channel';
export { Channel } from './channel-core';
export { default as channelBg } from './channel-bg';
export { default as channelPopup } from './channel-popup';
export { default as channelContent } from './channel-content';
export { default as channelOptions } from './channel-options';
export { default as channelDevTools } from './channel-devtools';
import { ChannelType } from './channel';
export declare function createChannel(type: ChannelType): import("./channel-bg").BackgroundChannel | import("./channel-popup").PopupChannel | import("./channel-content").ContentChannel | import("./channel-options").OptionsChannel | import("./channel-devtools").DevToolsChannel;
export declare const channel: {
    background: import("./channel-bg").BackgroundChannel;
    popup: import("./channel-popup").PopupChannel;
    content: import("./channel-content").ContentChannel;
    options: import("./channel-options").OptionsChannel;
    devtools: import("./channel-devtools").DevToolsChannel;
};
export default channel;
//# sourceMappingURL=channel-index.d.ts.map