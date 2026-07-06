import { IStorage, IPopup, ITabs, IMessaging, IProxyHttp } from '../interface';
import { AxiosInstance } from 'axios';
export default class Base {
    g_storage: IStorage;
    g_popup: IPopup;
    g_tabs: ITabs;
    g_messaging: IMessaging;
    g_http: AxiosInstance;
    g_proxy_http: IProxyHttp;
    constructor();
}
//# sourceMappingURL=index.d.ts.map