import { Channel } from './channel-core';
import { ChannelType, ChannelListener, ChannelOptions } from './channel';
export declare class PopupChannel {
    private _channel;
    constructor();
    get channel(): Channel;
    on(channel: string, handler: ChannelListener): () => void;
    off(channel: string, handler: ChannelListener): void;
    sendTo(to: ChannelType, payload: any, channel?: string): Promise<any>;
    request<T = any>(to: ChannelType, payload: any, channel?: string, options?: ChannelOptions): Promise<T>;
    sendToTab(tabId: number, payload: any, channel?: string): Promise<any>;
    broadcast(payload: any, channel?: string): void;
}
declare const _default: PopupChannel;
export default _default;
//# sourceMappingURL=channel-popup.d.ts.map