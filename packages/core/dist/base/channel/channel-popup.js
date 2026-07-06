import { Channel } from './channel-core';
import { ChannelType } from './channel';
export class PopupChannel {
    constructor() {
        this._channel = Channel.getInstance(ChannelType.POPUP);
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
    async sendTo(to, payload, channel) {
        if (to === ChannelType.CONTENT) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                return this._channel.send(to, payload, channel, tab.id);
            }
            throw new Error('No active tab found');
        }
        return this._channel.send(to, payload, channel);
    }
    async request(to, payload, channel, options) {
        if (to === ChannelType.CONTENT) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('[PopupChannel] request to CONTENT', tab);
            if (tab?.id) {
                return this._channel.request(to, payload, channel, options, tab.id);
            }
            throw new Error('No active tab found');
        }
        return this._channel.request(to, payload, channel, options);
    }
    sendToTab(tabId, payload, channel) {
        return this._channel.send(ChannelType.CONTENT, payload, channel, tabId);
    }
    broadcast(payload, channel) {
        this._channel.broadcast(payload, channel);
    }
}
export default new PopupChannel();
//# sourceMappingURL=channel-popup.js.map