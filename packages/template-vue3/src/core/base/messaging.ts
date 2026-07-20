import { IMessaging } from '../interface'

class Messaging implements IMessaging {
  sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }

  onMessage(
    callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void
  ): void {
    chrome.runtime.onMessage.addListener(callback)
  }
}

export default new Messaging()
