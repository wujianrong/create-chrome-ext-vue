import { Channel } from './channel-core';
import { ChannelType, ChannelListener, ChannelOptions } from './channel';
export declare class BackgroundChannel {
    private _channel;
    constructor();
    get channel(): Channel;
    on(channel: string, handler: ChannelListener): () => void;
    off(channel: string, handler: ChannelListener): void;
    sendTo(to: ChannelType, payload: any, channel?: string, tabId?: number): Promise<any>;
    request<T = any>(to: ChannelType, payload: any, channel?: string, options?: ChannelOptions, tabId?: number): Promise<T>;
    broadcast(payload: any, channel?: string): void;
    ping(to: ChannelType, tabId?: number): Promise<boolean>;
    replyTo(from: ChannelType, payload: any, channel?: string): Promise<any>;
}
declare const _default: BackgroundChannel;
export default _default;
//# sourceMappingURL=channel-bg.d.ts.map