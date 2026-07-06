import { Channel } from './channel-core';
import { ChannelType, ChannelListener, ChannelOptions } from './channel';
export declare class DevToolsChannel {
    private _channel;
    constructor();
    get channel(): Channel;
    on(channel: string, handler: ChannelListener): () => void;
    off(channel: string, handler: ChannelListener): void;
    sendTo(to: ChannelType, payload: any, channel?: string): Promise<any>;
    request<T = any>(to: ChannelType, payload: any, channel?: string, options?: ChannelOptions): Promise<T>;
    broadcast(payload: any, channel?: string): void;
}
declare const _default: DevToolsChannel;
export default _default;
//# sourceMappingURL=channel-devtools.d.ts.map