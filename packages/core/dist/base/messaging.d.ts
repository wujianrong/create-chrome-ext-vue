import { IMessaging } from '../interface';
declare class Messaging implements IMessaging {
    sendMessage(message: any): Promise<any>;
    onMessage(callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void): void;
}
declare const _default: Messaging;
export default _default;
//# sourceMappingURL=messaging.d.ts.map