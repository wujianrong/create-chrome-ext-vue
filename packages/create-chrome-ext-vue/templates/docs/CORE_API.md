# Core API 参考

本文档列出 `src/core/` 提供的所有公共 API，按功能分层组织。

---

## 基础设施层

提供 Chrome Extension 常用 API 的 Promise 封装，可直接导入使用。

### storage

`chrome.storage.local` 的 Promise 封装单例。

```ts
import { storage } from '@/core'

// 存储数据
await storage.set('token', 'abc123')

// 读取数据
const token = await storage.get('token')

// 删除数据
await storage.remove('token')

// 清空所有数据
await storage.clear()
```

| 方法 | 说明 |
|------|------|
| `set(key, value)` | 存储键值对 |
| `get(key)` | 读取指定 key 的值 |
| `remove(key)` | 删除指定 key |
| `clear()` | 清空所有存储 |

---

### popup

基于 `chrome.notifications` 的系统通知弹窗单例。

```ts
import { popup } from '@/core'

popup.info('操作提示信息')
popup.success('操作成功')
popup.warning('操作警告')
popup.error('操作失败')
```

| 方法 | 说明 |
|------|------|
| `info(message)` | 提示级别通知 |
| `success(message)` | 成功级别通知 |
| `warning(message)` | 警告级别通知 |
| `error(message)` | 错误级别通知 |

---

### tabs

`chrome.tabs` API 的 Promise 封装单例。

```ts
import { tabs } from '@/core'

// 获取当前标签页
const currentTab = await tabs.getCurrent()

// 创建新标签页
const newTab = await tabs.create('https://example.com')

// 查询标签页
const allTabs = await tabs.query({ active: true })

// 更新标签页
await tabs.update(tabId, { url: 'https://new-url.com' })

// 关闭标签页
await tabs.remove(tabId)
```

| 方法 | 说明 |
|------|------|
| `getCurrent()` | 获取当前标签页 |
| `create(url)` | 创建新标签页 |
| `update(tabId, props)` | 更新标签页属性 |
| `remove(tabId)` | 关闭标签页 |
| `query(queryInfo)` | 按条件查询标签页 |

---

### messaging

`chrome.runtime.sendMessage` / `onMessage` 的 Promise 封装单例。

```ts
import { messaging } from '@/core'

// 发送消息
const response = await messaging.sendMessage({ type: 'GET_DATA' })

// 监听消息
messaging.onMessage((message, sender, sendResponse) => {
  sendResponse({ data: 'ok' })
})
```

| 方法 | 说明 |
|------|------|
| `sendMessage(message)` | 发送消息并等待响应 |
| `onMessage(handler)` | 注册消息监听器 |

---

### createHttpInstance

创建配置好的 Axios 实例（10 秒超时，JSON 请求头，内置日志拦截器）。

```ts
import { createHttpInstance } from '@/core'

const http = createHttpInstance()

// 或自定义配置
const customHttp = createHttpInstance({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

// 标准 Axios 用法
const { data } = await http.get('/users')
await http.post('/users', { name: 'test' })
```

---

### proxyHttp

通过 Background Service Worker 中继的 HTTP 客户端，用于 Content Script 中绕过 CORS 限制。

```ts
import { proxyHttp } from '@/core'

// 所有请求通过 Background 代理发送
const data = await proxyHttp.get('https://api.example.com/data')
```

---

### Base

业务模块的基类（门面模式），一行构造即可注入所有基础能力。

```ts
import { Base } from '@/core'

class MyModule extends Base {
  constructor() {
    super()
    // 现在可直接使用以下属性：
    // this.g_storage   — 本地存储
    // this.g_popup     — 通知弹窗
    // this.g_tabs      — 标签页管理
    // this.g_messaging — 消息通信
    // this.g_http      — HTTP 客户端 (AxiosInstance)
    // this.g_proxy_http — 代理 HTTP 客户端
  }

  async doSomething() {
    this.g_popup.success('操作完成')
    const token = await this.g_storage.get('token')
    const { data } = await this.g_http.get('/api/data')
  }
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `g_storage` | `IStorage` | chrome.storage.local 封装 |
| `g_popup` | `IPopup` | 通知弹窗 |
| `g_tabs` | `ITabs` | 标签页管理 |
| `g_messaging` | `IMessaging` | 消息通信 |
| `g_http` | `AxiosInstance` | HTTP 客户端 |
| `g_proxy_http` | `IProxyHttp` | 代理 HTTP（通过 Background） |

---

## 通信层

提供 Chrome Extension 各组件间的类型安全消息通信。

### ChannelType

组件类型枚举。

```ts
import { ChannelType } from '@/core'

ChannelType.BACKGROUND  // Service Worker
ChannelType.POPUP       // 弹出窗口
ChannelType.CONTENT     // Content Script
ChannelType.OPTIONS     // 选项页
ChannelType.DEVTOOLS    // DevTools
```

### MessageType

消息类型枚举。

```ts
import { MessageType } from '@/core'

MessageType.CHANNEL_MESSAGE   // 单向发送
MessageType.CHANNEL_REQUEST   // 请求-响应
MessageType.CHANNEL_RESPONSE  // 响应
MessageType.CHANNEL_PING      // 心跳检测
MessageType.CHANNEL_PONG      // 心跳回复
```

### channelBg

Background Service Worker 的消息中心单例。

```ts
import { channelBg } from '@/core'

// 在 Background 中监听消息
channelBg.on('CUSTOM_ACTION', async (payload, sender) => {
  // 处理消息，返回结果
  return { success: true }
})
```

### channelPopup

Popup 窗口的通道单例，向 Content Script 发送时自动检测 activeTab。

```ts
import { channelPopup, ChannelType } from '@/core'

// 向 Content Script 发送请求
const result = await channelPopup.request(
  ChannelType.CONTENT,
  { action: 'getData' },
  'MY_ACTION'
)
```

### channelContent

Content Script 的通道单例。

```ts
import { channelContent } from '@/core'

// 监听来自 Popup/Background 的消息
channelContent.on('MY_ACTION', async (payload) => {
  return { result: 'hello' }
})
```

### 其他通道实例

```ts
import { channelOptions, channelDevTools } from '@/core'

// channelOptions — 选项页通道
// channelDevTools — DevTools 通道
// 用法与 channelContent 类似
```

---

### CrossWorldBridge

跨世界通信桥 —— 实现 ISOLATED Content Script（有 Chrome API）与 MAIN world（有 DOM 访问）之间的安全通信。

**ISOLATED 端（Content Script）：**

```ts
import { bridge } from '@/core'

// 1. 初始化（ISOLATED world）
bridge.init(false)

// 2. 向 MAIN world 发送请求
const result = await bridge.request('GET_PAGE_INFO', { key: 'value' })
```

**MAIN 端（main-world.ts）：**

```ts
import { bridge } from '@/core'

// 1. 初始化（MAIN world）
bridge.init(true)

// 2. 注册消息处理
bridge.on('GET_PAGE_INFO', async (payload) => {
  return {
    title: document.title,
    url: window.location.href
  }
})
```

---

## 模块层

提供业务模块的注册、路由生成和弹出窗口 UI 集成。

### ModuleRegistry

全局模块注册表单例。

```ts
import { moduleRegistry } from '@/core'

// 注册模块
moduleRegistry.register(myModule)

// 获取所有可用模块的元信息（用于首页卡片网格）
const modules = moduleRegistry.getModules()

// 按名称获取模块
const module = moduleRegistry.getModule('demo')

// 获取 Vue Router 路由配置
const routes = moduleRegistry.getRoutes()

// 批量初始化 Content Script 处理程序
moduleRegistry.initContentHandlers()

// 批量初始化 MAIN world 处理程序
moduleRegistry.initMainWorldHandlers()
```

| 方法 | 说明 |
|------|------|
| `register(module)` | 注册一个模块 |
| `getModules()` | 获取所有已启用模块的元信息 |
| `getModule(name)` | 按名称获取模块定义 |
| `getRoutes()` | 生成 Vue Router 路由配置 |
| `initContentHandlers()` | 批量注册 ISOLATED 处理程序 |
| `initMainWorldHandlers()` | 批量注册 MAIN world 处理程序 |

---

### IModule

模块定义接口。

```ts
import type { IModule } from '@/core'

const myModule: IModule = {
  name: 'my-module',           // 唯一标识
  label: '我的模块',            // 显示名称
  icon: 'Document',            // Element Plus 图标名
  category: '工具',            // 分类（CardGrid 按此分组）
  enabled: true,               // 是否启用
  description: '模块功能描述',
  actionType: 'popup',         // 'popup' | 'tab' | 'devtools' | 'sidepanel'
  targetUrl: '',               // actionType 为 'tab' 时的目标 URL
  route: {                     // 路由配置（仅 popup 类型需要）
    path: '/my-module',
    component: () => import('./MyComponent.vue')
  },
  registerContentHandlers: () => {
    // 注册 ISOLATED world 的消息处理
  },
  registerMainWorldHandlers: () => {
    // 注册 MAIN world 的消息处理
  }
}
```

### ModuleMeta

模块元信息类型（`getModules()` 返回值元素的类型）。

```ts
import type { ModuleMeta } from '@/core'
// { name, label, icon, category, description, actionType, targetUrl, route? }
```

### ModuleActionType

模块导航方式类型。

```ts
import type { ModuleActionType } from '@/core'
// 'popup' | 'tab' | 'devtools' | 'sidepanel'
```
