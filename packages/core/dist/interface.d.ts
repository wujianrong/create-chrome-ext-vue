export interface ICache {
    set(key: string, value: any): void;
    get(key: string): any;
    remove(key: string): void;
    clear(): void;
}
export interface IStorage {
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface IPopup {
    info(message: string): void;
    success(message: string): void;
    warning(message: string): void;
    error(message: string): void;
}
export interface ITabs {
    getCurrent(): Promise<chrome.tabs.Tab>;
    create(url: string): Promise<chrome.tabs.Tab>;
    update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab>;
}
export interface IOutput {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
}
export interface IMessaging {
    sendMessage(message: any): Promise<any>;
    onMessage(callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void): void;
}
export interface IProxyHttp {
    get<T = any>(url: string, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
    head<T = any>(url: string, config?: any): Promise<T>;
    options<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
    request<T = any>(config: any): Promise<T>;
    getUri(config?: any): string;
}
export interface IChannel {
    on(channel: string, handler: (payload: any, from: any, sender: any) => void): () => void;
    off(channel: string, handler: (payload: any, from: any, sender: any) => void): void;
    sendTo(to: number, payload: any, channel?: string): Promise<any>;
    request<T = any>(to: number, payload: any, channel?: string, options?: any): Promise<T>;
    broadcast(payload: any, channel?: string): void;
}
//# sourceMappingURL=interface.d.ts.map