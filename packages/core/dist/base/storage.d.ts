import { IStorage } from '../interface';
declare class Storage implements IStorage {
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
declare const _default: Storage;
export default _default;
//# sourceMappingURL=storage.d.ts.map