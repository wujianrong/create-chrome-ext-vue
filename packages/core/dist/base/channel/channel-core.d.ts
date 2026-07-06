import { ChannelType, ChannelOptions, ChannelListener } from './channel';
export declare class Channel {
    private static instance;
    private currentType;
    private listeners;
    private defaultOptions;
    constructor(type: ChannelType);
    static getInstance(type: ChannelType): Channel;
    static getCurrentType(): ChannelType;
    getType(): ChannelType;
    private generateMessageId;
    private sendToRuntimeOneWay;
    private sendToTabOneWay;
    private sendToRuntimeRequest;
    private sendToTabRequest;
    send<T = any>(to: ChannelType, payload: any, channel?: string, tabId?: number): Promise<T>;
    request<T = any>(to: ChannelType, payload: any, channel?: string, options?: ChannelOptions, tabId?: number): Promise<T>;
    on(channel: string, handler: ChannelListener): () => void;
    off(channel: string, handler: ChannelListener): void;
    private processLocalHandlers;
    private handleMessage;
    setupReceiver(): void;
    ping(to: ChannelType, tabId?: number): Promise<boolean>;
    broadcast(payload: any, channel?: string): void;
    setOptions(options: ChannelOptions): void;
}
export default Channel;
//# sourceMappingURL=channel-core.d.ts.map