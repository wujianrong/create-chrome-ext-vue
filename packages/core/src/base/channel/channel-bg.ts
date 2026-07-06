import { Channel } from './channel-core'
import { ChannelType, ChannelListener, ChannelOptions } from './channel'

export class BackgroundChannel {
  private _channel: Channel

  constructor() {
    this._channel = Channel.getInstance(ChannelType.BACKGROUND)
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

  sendTo(to: ChannelType, payload: any, channel?: string, tabId?: number): Promise<any> {
    return this._channel.send(to, payload, channel, tabId)
  }

  request<T = any>(to: ChannelType, payload: any, channel?: string, options?: ChannelOptions, tabId?: number): Promise<T> {
    return this._channel.request<T>(to, payload, channel, options, tabId)
  }

  broadcast(payload: any, channel?: string): void {
    this._channel.broadcast(payload, channel)
  }

  ping(to: ChannelType, tabId?: number): Promise<boolean> {
    return this._channel.ping(to, tabId)
  }

  replyTo(from: ChannelType, payload: any, channel?: string): Promise<any> {
    return this._channel.send(from, payload, channel)
  }
}

export default new BackgroundChannel()
