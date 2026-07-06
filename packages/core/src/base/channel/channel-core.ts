import {
  ChannelType,
  MessageType,
  ChannelMessage,
  ChannelOptions,
  Sender,
  ChannelListener
} from './channel'

export class Channel {
  private static instance: Channel
  private currentType: ChannelType
  private listeners: Map<string, Set<ChannelListener>> = new Map()
  private defaultOptions: ChannelOptions = {
    timeout: 10000,
    retryCount: 0,
    retryDelay: 100
  }

  constructor(type: ChannelType) {
    this.currentType = type
  }

  static getInstance(type: ChannelType): Channel {
    if (!Channel.instance) {
      Channel.instance = new Channel(type)
    } else {
      Channel.instance.currentType = type
    }
    return Channel.instance
  }

  static getCurrentType(): ChannelType {
    return Channel.instance?.currentType || ChannelType.BACKGROUND
  }

  getType(): ChannelType {
    return this.currentType
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  /** 单向发送到 runtime（fire-and-forget），发送成功后立即 resolve */
  private sendToRuntimeOneWay(message: ChannelMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  /** 单向发送到指定 tab（fire-and-forget），发送成功后立即 resolve */
  private sendToTabOneWay(tabId: number, message: ChannelMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * 请求-响应模式：发送到 runtime，通过 callback 获取响应
   */
  private sendToRuntimeRequest(message: ChannelMessage, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'))
      }, timeoutMs)

      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timer)
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }

  /**
   * 请求-响应模式：发送到指定 tab，通过 callback 获取响应
   */
  private sendToTabRequest(tabId: number, message: ChannelMessage, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'))
      }, timeoutMs)

      chrome.tabs.sendMessage(tabId, message, (response) => {
        clearTimeout(timer)
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }

  /**
   * 单向发送消息（fire-and-forget），发送成功即返回
   * @param to      目标组件
   * @param payload 消息载荷
   * @param channel 通道名称
   * @param tabId   发往 CONTENT 时必须提供 tabId
   */
  async send<T = any>(
    to: ChannelType,
    payload: any,
    channel?: string,
    tabId?: number
  ): Promise<T> {
    const message: ChannelMessage = {
      id: this.generateMessageId(),
      type: MessageType.CHANNEL_MESSAGE,
      from: this.currentType,
      to,
      channel,
      payload,
      timestamp: Date.now()
    }

    // Background 作为发送者
    if (this.currentType === ChannelType.BACKGROUND) {
      if (to === ChannelType.CONTENT) {
        if (tabId) {
          await this.sendToTabOneWay(tabId, message)
          return undefined as any
        }
        throw new Error('[Channel] send to CONTENT requires tabId')
      }
      if (to === ChannelType.BACKGROUND) {
        return this.processLocalHandlers(message, { tabId })
      }
      // Background → Popup / Options / DevTools：通过 runtime 发送
      await this.sendToRuntimeOneWay(message)
      return undefined as any
    }

    // Non-Background → Background（通过 runtime）
    if (to === ChannelType.BACKGROUND) {
      await this.sendToRuntimeOneWay(message)
      return undefined as any
    }

    // Non-Background → Content Script（直接通过 tab 发送）
    if (to === ChannelType.CONTENT) {
      if (tabId) {
        await this.sendToTabOneWay(tabId, message)
        return undefined as any
      }
      throw new Error('[Channel] send to CONTENT requires tabId')
    }

    // Non-Background → 其他 Non-Background（通过 Background 中转）
    await this.sendToRuntimeOneWay({
      ...message,
      type: MessageType.CHANNEL_REQUEST,
      to: ChannelType.BACKGROUND
    })
    return undefined as any
  }

  /**
   * 请求-响应模式，等待目标返回结果
   * @param to      目标组件
   * @param payload 请求载荷
   * @param channel 通道名称
   * @param options 超时等配置
   * @param tabId   发往 CONTENT 时必须提供 tabId
   */
  async request<T = any>(
    to: ChannelType,
    payload: any,
    channel?: string,
    options?: ChannelOptions,
    tabId?: number
  ): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const message: ChannelMessage = {
      id: this.generateMessageId(),
      type: MessageType.CHANNEL_REQUEST,
      from: this.currentType,
      to,
      channel,
      payload,
      timestamp: Date.now()
    }

    // Background 作为发送者
    if (this.currentType === ChannelType.BACKGROUND) {
      if (to === ChannelType.CONTENT) {
        if (tabId) {
          return this.sendToTabRequest(tabId, message, mergedOptions.timeout!)
        }
        throw new Error('[Channel] request to CONTENT requires tabId')
      }
      if (to === ChannelType.BACKGROUND) {
        return this.processLocalHandlers(message, { tabId })
      }
      // Background → Popup / Options / DevTools
      return this.sendToRuntimeRequest(message, mergedOptions.timeout!)
    }

    // Non-Background → Content Script（直接通过 tab 发送）
    if (to === ChannelType.CONTENT) {
      if (tabId) {
        return this.sendToTabRequest(tabId, message, mergedOptions.timeout!)
      }
      throw new Error('[Channel] request to CONTENT requires tabId')
    }

    // Non-Background → Background 或其他（通过 runtime）
    return this.sendToRuntimeRequest(message, mergedOptions.timeout!)
  }

  on(channel: string, handler: ChannelListener): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set())
    }
    this.listeners.get(channel)!.add(handler)

    return () => {
      this.listeners.get(channel)?.delete(handler)
    }
  }

  off(channel: string, handler: ChannelListener): void {
    this.listeners.get(channel)?.delete(handler)
  }

  /**
   * 处理本地注册的 handler（用于 Background 本地分发 & 路由）
   * 支持同步和异步 handler，返回最后一个 handler 的执行结果
   */
  private async processLocalHandlers(
    message: ChannelMessage,
    sender: Sender
  ): Promise<any> {
    const handlers = this.listeners.get(message.channel || '')
    if (!handlers || handlers.size === 0) {
      return { error: 'No handler found' }
    }

    let response: any
    for (const handler of handlers) {
      try {
        const result = handler(message.payload, message.from, sender)
        if (result instanceof Promise) {
          response = await result
        } else {
          response = result
        }
      } catch (err: any) {
        response = { error: err.message }
      }
    }
    return response
  }

  /**
   * 消息处理入口
   * - CHANNEL_REQUEST：查找本地 handler，返回其结果（通过 sendResponse 回传）
   * - CHANNEL_MESSAGE：触发 handler（fire-and-forget）
   * - CHANNEL_PING：回复 PONG
   */
  private handleMessage(
    message: ChannelMessage,
    sender: Sender,
    sendResponse: (response?: any) => void
  ): any {
    // CHANNEL_PING：回复 PONG
    if (message.type === MessageType.CHANNEL_PING) {
      sendResponse({ type: MessageType.CHANNEL_PONG, timestamp: Date.now() })
      return
    }

    // CHANNEL_REQUEST：处理请求并返回响应
    if (message.type === MessageType.CHANNEL_REQUEST) {
      const handlers = this.listeners.get(message.channel || '')
      if (!handlers || handlers.size === 0) {
        sendResponse({ error: 'No handler found' })
        return
      }

      // Background 作为中枢：异步处理并路由响应
      if (this.currentType === ChannelType.BACKGROUND) {
        // 返回 true 保持消息通道开放（Chrome API 异步响应要求）
        this.processLocalHandlers(message, sender)
          .then(res => {
            sendResponse(res)
          })
          .catch(err => {
            sendResponse({ error: err.message })
          })
        return true
      }

      // 非 Background（Content Script / Popup / Options / DevTools）
      // 取第一个 handler 的结果
      for (const handler of handlers) {
        try {
          const result = handler(message.payload, message.from, sender)
          if (result instanceof Promise) {
            result
              .then(res => sendResponse(res))
              .catch((err: any) => sendResponse({ error: err.message }))
            return true // 异步，保持通道开放
          }
          sendResponse(result)
          return
        } catch (err: any) {
          sendResponse({ error: err.message })
          return
        }
      }
      return
    }

    // CHANNEL_MESSAGE：触发 handler（fire-and-forget，无响应）
    if (message.type === MessageType.CHANNEL_MESSAGE) {
      const handlers = this.listeners.get(message.channel || '')
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message.payload, message.from, sender)
          } catch (err) {
            console.error(
              `[Channel] Handler error for channel "${message.channel}":`,
              err
            )
          }
        }
      }
    }
  }

  setupReceiver(): void {
    // 在某些上下文（如 MAIN world Content Script）中 chrome.runtime 不可用，此时跳过监听注册
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
      return
    }

    const buildSender = (s: chrome.runtime.MessageSender): Sender => ({
      tabId: s.tab?.id,
      frameId: s.frameId,
      url: s.url,
      origin: s.origin
    })

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // 过滤非本模块的消息
      if (!message.type || !Object.values(MessageType).includes(message.type)) {
        return
      }

      const chSender = buildSender(sender)
      const keepOpen = this.handleMessage(message, chSender, sendResponse)

      // 返回 true 表示异步响应（Chrome 扩展 API 要求）
      return keepOpen === true
    })
  }

  async ping(to: ChannelType, tabId?: number): Promise<boolean> {
    try {
      const message: ChannelMessage = {
        id: this.generateMessageId(),
        type: MessageType.CHANNEL_PING,
        from: this.currentType,
        to,
        payload: null,
        timestamp: Date.now()
      }

      if (to === ChannelType.CONTENT && tabId) {
        await this.sendToTabOneWay(tabId, message)
      } else {
        await this.sendToRuntimeOneWay(message)
      }
      return true
    } catch {
      return false
    }
  }

  broadcast(payload: any, channel?: string): void {
    const message: ChannelMessage = {
      id: this.generateMessageId(),
      type: MessageType.CHANNEL_MESSAGE,
      from: this.currentType,
      to: ChannelType.BACKGROUND,
      channel,
      payload,
      timestamp: Date.now()
    }

    this.sendToRuntimeOneWay(message).catch(console.error)
  }

  setOptions(options: ChannelOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }
}

export default Channel
