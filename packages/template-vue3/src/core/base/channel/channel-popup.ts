import { Channel } from './channel-core'
import { ChannelType, ChannelListener, ChannelOptions } from './channel'

export class PopupChannel {
  private _channel: Channel

  constructor() {
    this._channel = Channel.getInstance(ChannelType.POPUP)
    this._channel.setupReceiver()
  }

  get channel(): Channel {
    return this._channel
  }

  on(channel: string, handler: ChannelListener): () => void {
    return this._channel.on(channel, handler)
  }

  off(channel: string, handler: ChannelListener): void {
    this._channel.off(channel, handler)
  }

  async sendTo(to: ChannelType, payload: any, channel?: string): Promise<any> {
    if (to === ChannelType.CONTENT) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        return this._channel.send(to, payload, channel, tab.id)
      }
      throw new Error('No active tab found')
    }
    return this._channel.send(to, payload, channel)
  }

  async request<T = any>(to: ChannelType, payload: any, channel?: string, options?: ChannelOptions): Promise<T> {
    if (to === ChannelType.CONTENT) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      console.log('[PopupChannel] request to CONTENT', tab)
      if (tab?.id) {
        return this._channel.request<T>(to, payload, channel, options, tab.id)
      }
      throw new Error('No active tab found')
    }
    return this._channel.request<T>(to, payload, channel, options)
  }

  sendToTab(tabId: number, payload: any, channel?: string): Promise<any> {
    return this._channel.send(ChannelType.CONTENT, payload, channel, tabId)
  }

  broadcast(payload: any, channel?: string): void {
    this._channel.broadcast(payload, channel)
  }
}

export default new PopupChannel()
