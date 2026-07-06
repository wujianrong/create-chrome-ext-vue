import { Channel } from './channel-core';
import { ChannelType } from './channel';
export class DevToolsChannel {
    constructor() {
        this._channel = Channel.getInstance(ChannelType.DEVTOOLS);
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
    sendTo(to, payload, channel) {
        return this._channel.send(to, payload, channel);
    }
    request(to, payload, channel, options) {
        return this._channel.request(to, payload, channel, options);
    }
    broadcast(payload, channel) {
        this._channel.broadcast(payload, channel);
    }
}
export default new DevToolsChannel();
//# sourceMappingURL=channel-devtools.js.map