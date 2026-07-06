import { Channel } from './channel-core';
import { ChannelType } from './channel';
export class BackgroundChannel {
    constructor() {
        this._channel = Channel.getInstance(ChannelType.BACKGROUND);
        this._channel.setupReceiver();
    }
    get channel() {
        return this._channel;
    }
    on(channel, handler) {
        return this._channel.on(channel, handler);
    }
    off(channel, handler) {
        this._channel.off(channel, handler);
    }
    sendTo(to, payload, channel, tabId) {
        return this._channel.send(to, payload, channel, tabId);
    }
    request(to, payload, channel, options, tabId) {
        return this._channel.request(to, payload, channel, options, tabId);
    }
    broadcast(payload, channel) {
        this._channel.broadcast(payload, channel);
    }
    ping(to, tabId) {
        return this._channel.ping(to, tabId);
    }
    replyTo(from, payload, channel) {
        return this._channel.send(from, payload, channel);
    }
}
export default new BackgroundChannel();
//# sourceMappingURL=channel-bg.js.map