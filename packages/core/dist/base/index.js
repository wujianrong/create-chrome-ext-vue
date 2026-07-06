import storage from './storage';
import popup from './popup';
import tabs from './tabs';
import messaging from './messaging';
import http from './http';
import proxyHttp from './proxy-http';
export default class Base {
    constructor() {
        this.g_storage = storage;
        this.g_popup = popup;
        this.g_tabs = tabs;
        this.g_messaging = messaging;
        this.g_http = http;
        this.g_proxy_http = proxyHttp;
    }
}
//# sourceMappingURL=index.js.map