import { createHttpInstance } from '@/core'

console.log('Background script loaded')

const http = createHttpInstance()

// 监听来自content script或popup的消息
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Received message:', request)

  // HTTP请求代理
  if (request.type === 'HTTP_REQUEST') {
    try {
      const response = await http.request(request.config)
      sendResponse({ success: true, data: response })
    } catch (error: any) {
      sendResponse({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          response: error.response
        }
      })
    }
    return true
  }

  if (request.type === 'GET_DATA') {
    sendResponse({ data: 'Background response data' })
  }

  return true
})
