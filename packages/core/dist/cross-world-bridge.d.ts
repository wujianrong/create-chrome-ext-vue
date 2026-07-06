declare class CrossWorldBridge {
    private pending;
    private handlers;
    private ready;
    private isMainWorld;
    private pendingQueue;
    request<T = any>(channel: string, payload: any, timeout?: number): Promise<T>;
    on(channel: string, handler: (payload: any) => any | Promise<any>): void;
    init(asMainWorld: boolean): Promise<void>;
    private handleRequest;
    private sendResponse;
    private handleResponse;
    private handshake;
    private setReady;
    private postMessageToMainWorld;
    private postMessageToIsolatedWorld;
}
export declare const bridge: CrossWorldBridge;
export {};
//# sourceMappingURL=cross-world-bridge.d.ts.map