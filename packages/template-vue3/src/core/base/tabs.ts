import { ITabs } from '../interface'

class Tabs implements ITabs {
  /**
   * 获取当前标签页
   * @returns 当前标签页的Promise
   */
  getCurrent(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.getCurrent(tab => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          if (tab) {
            resolve(tab)
          } else {
            reject(new Error('无法获取当前标签页'))
          }
        }
      })
    })
  }

  /**
   * 创建新标签页
   * @param url 标签页地址
   * @returns 新创建标签页的Promise
   */
  create(url: string): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url }, tab => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(tab)
        }
      })
    })
  }

  /**
   * 更新指定标签页
   * @param tabId 标签页ID
   * @param updateProperties 更新属性
   * @returns 更新后标签页的Promise
   */
  update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.update(tabId, updateProperties, tab => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          if (tab) {
            resolve(tab)
          } else {
            reject(new Error('无法更新标签页'))
          }
        }
      })
    })
  }

  /**
   * 关闭指定标签页
   * @param tabId 标签页ID
   * @returns 关闭结果的Promise
   */
  remove(tabId: number | number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Array.isArray(tabId)) {
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      } else {
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      }
    })
  }

  /**
   * 查询符合条件的标签页
   * @param queryInfo 查询条件
   * @returns 符合条件的标签页数组的Promise
   */
  query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(queryInfo, tabs => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(tabs)
        }
      })
    })
  }

  /**
   * 执行脚本
   * @param tabId 标签页ID
   * @param details 脚本详情
   * @returns 执行结果的Promise
   */
  // executeScript(tabId: number, details: chrome.tabs.InjectDetails): Promise<any[]> {
  //   return new Promise((resolve, reject) => {
  //     chrome.tabs.executeScript(tabId, details, result => {
  //       if (chrome.runtime.lastError) {
  //         reject(chrome.runtime.lastError)
  //       } else {
  //         resolve(result)
  //       }
  //     })
  //   })
  // }
}

export default new Tabs()
