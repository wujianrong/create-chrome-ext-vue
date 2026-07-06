import { ChannelType, MessageType } from './channel';
export class Channel {
    constructor(type) {
        this.listeners = new Map();
        this.defaultOptions = {
            timeout: 10000,
            retryCount: 0,
            retryDelay: 100
        };
        this.currentType = type;
    }
    static getInstance(type) {
        if (!Channel.instance) {
            Channel.instance = new Channel(type);
        }
        else {
            Channel.instance.currentType = type;
        }
        return Channel.instance;
    }
    static getCurrentType() {
        return Channel.instance?.currentType || ChannelType.BACKGROUND;
    }
    getType() {
        return this.currentType;
    }
    generateMessageId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    sendToRuntimeOneWay(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
    sendToTabOneWay(tabId, message) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, message, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
    sendToRuntimeRequest(message, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeoutMs);
            chrome.runtime.sendMessage(message, (response) => {
                clearTimeout(timer);
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    sendToTabRequest(tabId, message, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeoutMs);
            chrome.tabs.sendMessage(tabId, message, (response) => {
                clearTimeout(timer);
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    async send(to, payload, channel, tabId) {
        const message = {
            id: this.generateMessageId(),
            type: MessageType.CHANNEL_MESSAGE,
            from: this.currentType,
            to,
            channel,
            payload,
            timestamp: Date.now()
        };
        if (this.currentType === ChannelType.BACKGROUND) {
            if (to === ChannelType.CONTENT) {
                if (tabId) {
                    await this.sendToTabOneWay(tabId, message);
                    return undefined;
                }
                throw new Error('[Channel] send to CONTENT requires tabId');
            }
            if (to === ChannelType.BACKGROUND) {
                return this.processLocalHandlers(message, { tabId });
            }
            await this.sendToRuntimeOneWay(message);
            return undefined;
        }
        if (to === ChannelType.BACKGROUND) {
            await this.sendToRuntimeOneWay(message);
            return undefined;
        }
        if (to === ChannelType.CONTENT) {
            if (tabId) {
                await this.sendToTabOneWay(tabId, message);
                return undefined;
            }
            throw new Error('[Channel] send to CONTENT requires tabId');
        }
        await this.sendToRuntimeOneWay({
            ...message,
            type: MessageType.CHANNEL_REQUEST,
            to: ChannelType.BACKGROUND
        });
        return undefined;
    }
    async request(to, payload, channel, options, tabId) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        const message = {
            id: this.generateMessageId(),
            type: MessageType.CHANNEL_REQUEST,
            from: this.currentType,
            to,
            channel,
            payload,
            timestamp: Date.now()
        };
        if (this.currentType === ChannelType.BACKGROUND) {
            if (to === ChannelType.CONTENT) {
                if (tabId) {
                    return this.sendToTabRequest(tabId, message, mergedOptions.timeout);
                }
                throw new Error('[Channel] request to CONTENT requires tabId');
            }
            if (to === ChannelType.BACKGROUND) {
                return this.processLocalHandlers(message, { tabId });
            }
            return this.sendToRuntimeRequest(message, mergedOptions.timeout);
        }
        if (to === ChannelType.CONTENT) {
            if (tabId) {
                return this.sendToTabRequest(tabId, message, mergedOptions.timeout);
            }
            throw new Error('[Channel] request to CONTENT requires tabId');
        }
        return this.sendToRuntimeRequest(message, mergedOptions.timeout);
    }
    on(channel, handler) {
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set());
        }
        this.listeners.get(channel).add(handler);
        return () => {
            this.listeners.get(channel)?.delete(handler);
        };
    }
    off(channel, handler) {
        this.listeners.get(channel)?.delete(handler);
    }
    async processLocalHandlers(message, sender) {
        const handlers = this.listeners.get(message.channel || '');
        if (!handlers || handlers.size === 0) {
            return { error: 'No handler found' };
        }
        let response;
        for (const handler of handlers) {
            try {
                const result = handler(message.payload, message.from, sender);
                if (result instanceof Promise) {
                    response = await result;
                }
                else {
                    response = result;
                }
            }
            catch (err) {
                response = { error: err.message };
            }
        }
        return response;
    }
    handleMessage(message, sender, sendResponse) {
        if (message.type === MessageType.CHANNEL_PING) {
            sendResponse({ type: MessageType.CHANNEL_PONG, timestamp: Date.now() });
            return;
        }
        if (message.type === MessageType.CHANNEL_REQUEST) {
            const handlers = this.listeners.get(message.channel || '');
            if (!handlers || handlers.size === 0) {
                sendResponse({ error: 'No handler found' });
                return;
            }
            if (this.currentType === ChannelType.BACKGROUND) {
                this.processLocalHandlers(message, sender)
                    .then(res => {
                    sendResponse(res);
                })
                    .catch(err => {
                    sendResponse({ error: err.message });
                });
                return true;
            }
            for (const handler of handlers) {
                try {
                    const result = handler(message.payload, message.from, sender);
                    if (result instanceof Promise) {
                        result
                            .then(res => sendResponse(res))
                            .catch((err) => sendResponse({ error: err.message }));
                        return true;
                    }
                    sendResponse(result);
                    return;
                }
                catch (err) {
                    sendResponse({ error: err.message });
                    return;
                }
            }
            return;
        }
        if (message.type === MessageType.CHANNEL_MESSAGE) {
            const handlers = this.listeners.get(message.channel || '');
            if (handlers) {
                for (const handler of handlers) {
                    try {
                        handler(message.payload, message.from, sender);
                    }
                    catch (err) {
                        console.error(`[Channel] Handler error for channel "${message.channel}":`, err);
                    }
                }
            }
        }
    }
    setupReceiver() {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
            return;
        }
        const buildSender = (s) => ({
            tabId: s.tab?.id,
            frameId: s.frameId,
            url: s.url,
            origin: s.origin
        });
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (!message.type || !Object.values(MessageType).includes(message.type)) {
                return;
            }
            const chSender = buildSender(sender);
            const keepOpen = this.handleMessage(message, chSender, sendResponse);
            return keepOpen === true;
        });
    }
    async ping(to, tabId) {
        try {
            const message = {
                id: this.generateMessageId(),
                type: MessageType.CHANNEL_PING,
                from: this.currentType,
                to,
                payload: null,
                timestamp: Date.now()
            };
            if (to === ChannelType.CONTENT && tabId) {
                await this.sendToTabOneWay(tabId, message);
            }
            else {
                await this.sendToRuntimeOneWay(message);
            }
            return true;
        }
        catch {
            return false;
        }
    }
    broadcast(payload, channel) {
        const message = {
            id: this.generateMessageId(),
            type: MessageType.CHANNEL_MESSAGE,
            from: this.currentType,
            to: ChannelType.BACKGROUND,
            channel,
            payload,
            timestamp: Date.now()
        };
        this.sendToRuntimeOneWay(message).catch(console.error);
    }
    setOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }
}
export default Channel;
//# sourceMappingURL=channel-core.js.map