export declare enum ChannelType {
    BACKGROUND = "background",
    POPUP = "popup",
    CONTENT = "content",
    OPTIONS = "options",
    DEVTOOLS = "devtools"
}
export declare enum MessageType {
    CHANNEL_MESSAGE = "CHANNEL_MESSAGE",
    CHANNEL_REQUEST = "CHANNEL_REQUEST",
    CHANNEL_RESPONSE = "CHANNEL_RESPONSE",
    CHANNEL_PING = "CHANNEL_PING",
    CHANNEL_PONG = "CHANNEL_PONG"
}
export interface ChannelMessage {
    id: string;
    type: MessageType;
    from: ChannelType;
    to: ChannelType;
    channel?: string;
    payload: any;
    timestamp: number;
}
export interface ChannelOptions {
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
}
export interface Sender {
    tabId?: number;
    frameId?: number;
    url?: string;
    origin?: string;
}
export interface ChannelRequest<T = any> {
    resolve: (value: T) => void;
    reject: (error: any) => void;
    timer?: ReturnType<typeof setTimeout>;
}
export type MessageHandler = (message: any, sender: Sender, response: (response?: any) => void) => void;
export type ChannelListener = (payload: any, from: ChannelType, sender: Sender) => any;
//# sourceMappingURL=channel.d.ts.map