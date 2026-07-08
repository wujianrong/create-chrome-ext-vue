/**
 * Chrome扩展基础类
 * 用于集成插件基础能力，对模块进行赋能
 */
import storage from './storage' // 本地存储
import popup from './popup' // popup提示
import tabs from './tabs' // 标签页管理
import messaging from './messaging' // 消息通信
import http from './http' // http请求
import proxyHttp from './proxy-http' // 代理HTTP请求（通过background）

import { IStorage, IPopup, ITabs, IMessaging, IProxyHttp } from '../interface'
import axios, { AxiosInstance } from 'axios'

export default class Base {
  g_storage: IStorage
  g_popup: IPopup
  g_tabs: ITabs
  g_messaging: IMessaging
  g_http: AxiosInstance
  g_proxy_http: IProxyHttp

  constructor() {
    this.g_storage = storage
    this.g_popup = popup
    this.g_tabs = tabs
    this.g_messaging = messaging
    this.g_http = http
    this.g_proxy_http = proxyHttp
  }
}
