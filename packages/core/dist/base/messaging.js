class Messaging {
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    onMessage(callback) {
        chrome.runtime.onMessage.addListener(callback);
    }
}
export default new Messaging();
//# sourceMappingURL=messaging.js.map