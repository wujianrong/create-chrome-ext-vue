const DEFAULT_TIMEOUT = 30000;
class CrossWorldBridge {
    constructor() {
        this.pending = new Map();
        this.handlers = new Map();
        this.ready = false;
        this.isMainWorld = false;
        this.pendingQueue = [];
    }
    request(channel, payload, timeout = DEFAULT_TIMEOUT) {
        return new Promise((resolve, reject) => {
            const requestId = `__cwb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const timer = setTimeout(() => {
                this.pending.delete(requestId);
                reject(new Error(`跨世界请求超时: ${channel} (${timeout}ms)`));
            }, timeout);
            this.pending.set(requestId, { resolve, reject, timer });
            this.postMessageToMainWorld({
                source: 'cs-isolated',
                type: 'REQUEST',
                secret: __CROSS_WORLD_SECRET__,
                channel,
                payload,
                requestId
            });
        });
    }
    on(channel, handler) {
        this.handlers.set(channel, handler);
    }
    init(asMainWorld) {
        this.isMainWorld = asMainWorld;
        window.addEventListener('message', (event) => {
            if (event.source !== window)
                return;
            const msg = event.data;
            if (!msg || msg.secret !== __CROSS_WORLD_SECRET__)
                return;
            if (asMainWorld && msg.source === 'cs-isolated') {
                if (msg.type === 'REQUEST') {
                    this.handleRequest(msg);
                }
                else if (msg.type === 'PING_MAIN') {
                    this.postMessageToIsolatedWorld({
                        source: 'cs-main',
                        type: 'PONG',
                        secret: __CROSS_WORLD_SECRET__
                    });
                }
                else if (msg.type === 'HANDSHAKE') {
                    this.postMessageToIsolatedWorld({
                        source: 'cs-main',
                        type: 'HANDSHAKE',
                        secret: __CROSS_WORLD_SECRET__
                    });
                    this.setReady();
                }
            }
            else if (!asMainWorld && msg.source === 'cs-main') {
                if (msg.type === 'RESPONSE') {
                    this.handleResponse(msg);
                }
                else if (msg.type === 'PONG') {
                    this.setReady();
                }
                else if (msg.type === 'HANDSHAKE') {
                    this.setReady();
                }
            }
        });
        this.handshake();
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.ready) {
                    resolve();
                }
                else {
                    setTimeout(checkReady, 50);
                }
            };
            const fallbackTimer = setTimeout(() => {
                if (!this.ready) {
                    console.warn('[CrossWorldBridge] 握手超时，强制标记就绪');
                    this.setReady();
                }
            }, 5000);
            checkReady();
            const checkAndClean = () => {
                if (!this.ready) {
                    setTimeout(checkAndClean, 50);
                }
                else {
                    clearTimeout(fallbackTimer);
                    resolve();
                }
            };
            checkAndClean();
        });
    }
    async handleRequest(msg) {
        const handler = this.handlers.get(msg.channel || '');
        if (!handler) {
            this.sendResponse(msg.requestId || '', undefined, `未知 channel: ${msg.channel}`);
            return;
        }
        try {
            const result = await handler(msg.payload);
            this.sendResponse(msg.requestId || '', result);
        }
        catch (e) {
            this.sendResponse(msg.requestId || '', undefined, e?.message || String(e));
        }
    }
    sendResponse(requestId, result, error) {
        this.postMessageToIsolatedWorld({
            source: 'cs-main',
            type: 'RESPONSE',
            secret: __CROSS_WORLD_SECRET__,
            requestId,
            result,
            error
        });
    }
    handleResponse(msg) {
        const requestId = msg.requestId || '';
        const p = this.pending.get(requestId);
        if (!p)
            return;
        this.pending.delete(requestId);
        clearTimeout(p.timer);
        if (msg.error) {
            p.reject(new Error(msg.error));
        }
        else {
            p.resolve(msg.result);
        }
    }
    handshake() {
        if (this.isMainWorld) {
            this.postMessageToIsolatedWorld({
                source: 'cs-main',
                type: 'HANDSHAKE',
                secret: __CROSS_WORLD_SECRET__
            });
        }
        else {
            this.postMessageToMainWorld({
                source: 'cs-isolated',
                type: 'HANDSHAKE',
                secret: __CROSS_WORLD_SECRET__
            });
            const pingTimer = setInterval(() => {
                if (this.ready) {
                    clearInterval(pingTimer);
                    return;
                }
                this.postMessageToMainWorld({
                    source: 'cs-isolated',
                    type: 'PING_MAIN',
                    secret: __CROSS_WORLD_SECRET__
                });
            }, 500);
        }
    }
    setReady() {
        if (this.ready)
            return;
        this.ready = true;
        console.log('[CrossWorldBridge] 握手完成，双端就绪');
        const queue = [...this.pendingQueue];
        this.pendingQueue = [];
        queue.forEach(msg => {
            if (this.isMainWorld) {
                this.handleRequest(msg);
            }
        });
    }
    postMessageToMainWorld(msg) {
        window.postMessage(msg, '*');
    }
    postMessageToIsolatedWorld(msg) {
        window.postMessage(msg, '*');
    }
}
export const bridge = new CrossWorldBridge();
//# sourceMappingURL=cross-world-bridge.js.map