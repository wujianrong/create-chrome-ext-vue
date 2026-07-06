import { IPopup } from '../interface';
declare class Popup implements IPopup {
    private getIconUrl;
    info(message: string): void;
    success(message: string): void;
    warning(message: string): void;
    error(message: string): void;
}
declare const _default: Popup;
export default _default;
//# sourceMappingURL=popup.d.ts.map