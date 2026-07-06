import type { AxiosInstance } from 'axios';
export interface VersionInfo {
    version: string;
    downloadUrl: string;
    releaseNotes: string;
    releaseDate: string;
    minVersion?: string;
}
export interface UpdateStatus {
    hasUpdate: boolean;
    isForced: boolean;
    latest: VersionInfo;
    current: string;
    lastCheckTime: number;
}
export interface DismissRecord {
    version: string;
    dismissedAt: number;
}
export declare const STORAGE_KEYS: {
    readonly UPDATE_STATUS: "update_status";
    readonly UPDATE_DISMISSED: "update_dismissed";
};
export declare function isNewerVersion(latest: string, current: string): boolean;
export declare function getLocalVersion(): string;
export declare function fetchRemoteVersion(httpInstance?: AxiosInstance): Promise<VersionInfo>;
export declare function checkForceUpdate(current: string, minVersion?: string): boolean;
export declare function isDismissed(version: string, dismissRecord: DismissRecord | null): boolean;
//# sourceMappingURL=version-checker.d.ts.map