class Popup {
    getIconUrl() {
        try {
            return chrome.runtime.getURL('assets/images/icon.png');
        }
        catch {
            return '';
        }
    }
    info(message) {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: this.getIconUrl(),
                title: '提示',
                message: message
            });
        }
        catch (error) {
            console.warn('Notification info error:', error);
        }
    }
    success(message) {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: this.getIconUrl(),
                title: '成功',
                message: message,
                priority: 1
            });
        }
        catch (error) {
            console.warn('Notification success error:', error);
        }
    }
    warning(message) {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: this.getIconUrl(),
                title: '警告',
                message: message,
                priority: 1
            });
        }
        catch (error) {
            console.warn('Notification warning error:', error);
        }
    }
    error(message) {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: this.getIconUrl(),
                title: '错误',
                message: message,
                priority: 2
            });
        }
        catch (error) {
            console.warn('Notification error:', error);
        }
    }
}
export default new Popup();
//# sourceMappingURL=popup.js.map