import { ITabs } from '../interface';
declare class Tabs implements ITabs {
    getCurrent(): Promise<chrome.tabs.Tab>;
    create(url: string): Promise<chrome.tabs.Tab>;
    update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab>;
    remove(tabId: number | number[]): Promise<void>;
    query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]>;
}
declare const _default: Tabs;
export default _default;
//# sourceMappingURL=tabs.d.ts.map