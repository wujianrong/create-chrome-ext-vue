class Tabs {
    getCurrent() {
        return new Promise((resolve, reject) => {
            chrome.tabs.getCurrent(tab => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    if (tab) {
                        resolve(tab);
                    }
                    else {
                        reject(new Error('无法获取当前标签页'));
                    }
                }
            });
        });
    }
    create(url) {
        return new Promise((resolve, reject) => {
            chrome.tabs.create({ url }, tab => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve(tab);
                }
            });
        });
    }
    update(tabId, updateProperties) {
        return new Promise((resolve, reject) => {
            chrome.tabs.update(tabId, updateProperties, tab => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    if (tab) {
                        resolve(tab);
                    }
                    else {
                        reject(new Error('无法更新标签页'));
                    }
                }
            });
        });
    }
    remove(tabId) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(tabId)) {
                chrome.tabs.remove(tabId, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                chrome.tabs.remove(tabId, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
    }
    query(queryInfo) {
        return new Promise((resolve, reject) => {
            chrome.tabs.query(queryInfo, tabs => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve(tabs);
                }
            });
        });
    }
}
export default new Tabs();
//# sourceMappingURL=tabs.js.map