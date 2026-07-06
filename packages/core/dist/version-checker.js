import http from './base/http';
const VERSION_CHECK_URL = 'https://erphostjs.kye-erp.com/fms/611986/chrome-condition/version.json';
export const STORAGE_KEYS = {
    UPDATE_STATUS: 'update_status',
    UPDATE_DISMISSED: 'update_dismissed'
};
export function isNewerVersion(latest, current) {
    const a = latest.split('.').map(Number);
    const b = current.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const segA = a[i] || 0;
        const segB = b[i] || 0;
        if (segA > segB)
            return true;
        if (segA < segB)
            return false;
    }
    return false;
}
export function getLocalVersion() {
    return chrome.runtime.getManifest().version;
}
export async function fetchRemoteVersion(httpInstance) {
    const client = httpInstance || http;
    const response = await client.get(VERSION_CHECK_URL, {
        params: { _t: Date.now() }
    });
    return response.data;
}
export function checkForceUpdate(current, minVersion) {
    if (!minVersion)
        return false;
    return isNewerVersion(minVersion, current);
}
export function isDismissed(version, dismissRecord) {
    if (!dismissRecord)
        return false;
    return dismissRecord.version === version;
}
//# sourceMappingURL=version-checker.js.map