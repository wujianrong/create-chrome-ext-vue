/**
 * 跨 ISOLATED/MAIN world 通信桥
 *
 * 通过 window.postMessage 在两个 Content Script world 之间建立请求-响应通信。
 * ISOLATED 端调用 request() 发请求，MAIN 端通过 on() 注册处理函数。
 * 消息通过构建时注入的 __CROSS_WORLD_SECRET__ 进行安全校验。
 */

/** 消息协议 */
interface CrossWorldMessage {
  source: 'cs-isolated' | 'cs-main'
  type: 'REQUEST' | 'RESPONSE' | 'HANDSHAKE' | 'PING_MAIN' | 'PONG'
  secret: string
  channel?: string
  requestId?: string
  payload?: any
  result?: any
  error?: string
}

/** 默认超时时间（ms） */
const DEFAULT_TIMEOUT = 30000

class CrossWorldBridge {
  private pending = new Map<string, {
    resolve: (v: any) => void
    reject: (e: Error) => void
    timer: ReturnType<typeof setTimeout>
  }>()
  private handlers = new Map<string, (payload: any) => any | Promise<any>>()
  private ready = false
  private isMainWorld = false
  private pendingQueue: CrossWorldMessage[] = []

  // ========== ISOLATED 端：发请求给 MAIN world ==========

  /** 向 MAIN world 发送请求并等待响应 */
  request<T = any>(channel: string, payload: any, timeout: number = DEFAULT_TIMEOUT): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `__cwb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error(`跨世界请求超时: ${channel} (${timeout}ms)`))
      }, timeout)

      this.pending.set(requestId, { resolve, reject, timer })

      this.postMessageToMainWorld({
        source: 'cs-isolated',
        type: 'REQUEST',
        secret: __CROSS_WORLD_SECRET__,
        channel,
        payload,
        requestId
      })
    })
  }

  // ========== MAIN 端：注册业务处理函数 ==========

  /** 注册 MAIN world 端的消息处理函数 */
  on(channel: string, handler: (payload: any) => any | Promise<any>): void {
    this.handlers.set(channel, handler)
  }

  // ========== 初始化 ==========

  /** 初始化跨世界通信桥 */
  init(asMainWorld: boolean): Promise<void> {
    this.isMainWorld = asMainWorld

    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      const msg = event.data as CrossWorldMessage
      if (!msg || msg.secret !== __CROSS_WORLD_SECRET__) return

      if (asMainWorld && msg.source === 'cs-isolated') {
        if (msg.type === 'REQUEST') {
          this.handleRequest(msg)
        } else if (msg.type === 'PING_MAIN') {
          this.postMessageToIsolatedWorld({
            source: 'cs-main',
            type: 'PONG',
            secret: __CROSS_WORLD_SECRET__
          })
        } else if (msg.type === 'HANDSHAKE') {
          // ISOLATED 已就绪，MAIN 回应握手 + 处理排队消息
          this.postMessageToIsolatedWorld({
            source: 'cs-main',
            type: 'HANDSHAKE',
            secret: __CROSS_WORLD_SECRET__
          })
          this.setReady()
        }
      } else if (!asMainWorld && msg.source === 'cs-main') {
        if (msg.type === 'RESPONSE') {
          this.handleResponse(msg)
        } else if (msg.type === 'PONG') {
          // MAIN world 已就绪
          this.setReady()
        } else if (msg.type === 'HANDSHAKE') {
          this.setReady()
        }
      }
    })

    // 发送初始握手
    this.handshake()

    return new Promise<void>((resolve) => {
      // 等待握手完成
      const checkReady = () => {
        if (this.ready) {
          resolve()
        } else {
          setTimeout(checkReady, 50)
        }
      }
      // 同时加一个超时兜底：如果 5s 后还没握手成功就直接标记就绪
      const fallbackTimer = setTimeout(() => {
        if (!this.ready) {
          console.warn('[CrossWorldBridge] 握手超时，强制标记就绪')
          this.setReady()
        }
      }, 5000)
      checkReady()
      // 就绪后清理 fallback timer
      const checkAndClean = () => {
        if (!this.ready) {
          setTimeout(checkAndClean, 50)
        } else {
          clearTimeout(fallbackTimer)
          resolve()
        }
      }
      checkAndClean()
    })
  }

  // ========== 内部方法 ==========

  /** MAIN 端：处理收到的 REQUEST */
  private async handleRequest(msg: CrossWorldMessage): Promise<void> {
    const handler = this.handlers.get(msg.channel || '')
    if (!handler) {
      this.sendResponse(msg.requestId || '', undefined, `未知 channel: ${msg.channel}`)
      return
    }
    try {
      const result = await handler(msg.payload)
      this.sendResponse(msg.requestId || '', result)
    } catch (e: any) {
      this.sendResponse(msg.requestId || '', undefined, e?.message || String(e))
    }
  }

  /** MAIN 端：发送 RESPONSE 给 ISOLATED world */
  private sendResponse(requestId: string, result?: any, error?: string): void {
    this.postMessageToIsolatedWorld({
      source: 'cs-main',
      type: 'RESPONSE',
      secret: __CROSS_WORLD_SECRET__,
      requestId,
      result,
      error
    })
  }

  /** ISOLATED 端：处理收到的 RESPONSE */
  private handleResponse(msg: CrossWorldMessage): void {
    const requestId = msg.requestId || ''
    const p = this.pending.get(requestId)
    if (!p) return

    this.pending.delete(requestId)
    clearTimeout(p.timer)

    if (msg.error) {
      p.reject(new Error(msg.error))
    } else {
      p.resolve(msg.result)
    }
  }

  /** 握手机制：ISOLATED 端主动探测 MAIN 端 */
  private handshake(): void {
    if (this.isMainWorld) {
      // MAIN 端：发送 HANDSHAKE
      this.postMessageToIsolatedWorld({
        source: 'cs-main',
        type: 'HANDSHAKE',
        secret: __CROSS_WORLD_SECRET__
      })
      // 同时启动 PING 探测
      // MAIN 端不需要 PING，等待 ISOLATED 来探测即可
    } else {
      // ISOLATED 端：先发 HANDSHAKE，再 PING 探测
      this.postMessageToMainWorld({
        source: 'cs-isolated',
        type: 'HANDSHAKE',
        secret: __CROSS_WORLD_SECRET__
      })
      // 定时 PING 探测，直到 MAIN 回应
      const pingTimer = setInterval(() => {
        if (this.ready) {
          clearInterval(pingTimer)
          return
        }
        this.postMessageToMainWorld({
          source: 'cs-isolated',
          type: 'PING_MAIN',
          secret: __CROSS_WORLD_SECRET__
        })
      }, 500)
    }
  }

  /** 标记就绪并处理排队消息 */
  private setReady(): void {
    if (this.ready) return
    this.ready = true
    console.log('[CrossWorldBridge] 握手完成，双端就绪')

    // 处理排队消息
    const queue = [...this.pendingQueue]
    this.pendingQueue = []
    queue.forEach(msg => {
      if (this.isMainWorld) {
        this.handleRequest(msg)
      }
    })
  }

  /** 发消息给 MAIN world */
  private postMessageToMainWorld(msg: CrossWorldMessage): void {
    window.postMessage(msg, '*')
  }

  /** 发消息给 ISOLATED world */
  private postMessageToIsolatedWorld(msg: CrossWorldMessage): void {
    window.postMessage(msg, '*')
  }
}

export const bridge = new CrossWorldBridge()
