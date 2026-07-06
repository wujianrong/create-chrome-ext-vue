# Chrome 插件项目架构文档

## 一、总体架构概览

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        Chrome Extension Architecture                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│      Popup UI        │     │    SidePanel UI      │     │   DevTools Panel     │
│    (Vue3 + Router)   │     │    (Vue3 + Router)   │     │    (Vue3 + Router)   │
├──────────────────────┤     ├──────────────────────┤     ├──────────────────────┤
│ - HomePage.vue       │     │ - SidePanel main     │     │ - TabApp main        │
│ - ModulePage.vue     │     │                      │     │                      │
│ - CardGrid.vue       │     │                      │     │                      │
│ - TreeMenu.vue       │     │                      │     │                      │
│ - UpdateBanner.vue   │     │                      │     │                      │
└──────────┬───────────┘     └──────────┬───────────┘     └──────────┬───────────┘
           │                            │                            │
           │ chrome.runtime.sendMessage │                            │
           └────────────┬───────────────┘                            │
                        │                                            │
                        ▼                                            │
         ┌──────────────────────────────┐                          │
         │      Background Service      │                          │
         │         Worker               │                          │
         ├──────────────────────────────┤                          │
         │ - HTTP Request Proxy         │◄─────────────────────────┘
         │ - Message Router             │
         │ - Storage/Tab Management     │
         └──────────────┬───────────────┘
                        │
                        │ chrome.storage, chrome.tabs API
                        ▼
                  ┌───────────────┐
                  │   Chrome API  │
                  └───────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         Content Script World Split                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐          postMessage          ┌─────────────────────────────┐
│    ISOLATED World           │◄─────────────────────────────►│      MAIN World             │
│    (cs-isolated.ts)         │                                 │    (cs-main.ts)           │
├─────────────────────────────┤                                 ├─────────────────────────────┤
│ ✅ chrome.runtime.* API    │                                 │ ❌ chrome.runtime.* API   │
│ ❌ 访问页面 window 对象      │                                 │ ✅ 访问页面 __vue__ 对象     │
│ ✅ 不受 CSP 限制            │                                 │ ✅ DevTools 可断点调试      │
│                             │                                 │                             │
│ ┌─────────────────────────┐ │                                 │ ┌─────────────────────────┐ │
│ │ CrossWorldBridge        │ │                                 │ │ CrossWorldBridge        │ │
│ │ - request() / on()      │ │                                 │ | - request() / on()      │ │
│ │ - Handshake 机制        │ │                                 │ │ - Handshake 机制        │ │
│ └──────────┬──────────────┘ │                                 │ └──────────┬──────────────┘ │
│            │                 │                                 │            │                │
│            │ bridge.request  │                                 │  bridge.on   │                │
│            ▼                 │                                 │            ▼               │
│ ┌─────────────────────────┐ │                                 │ ┌─────────────────────────┐ │
│ │ Channel Content         │ │                                 │ │ Module Main World       │ │
│ │ - 消息转发层 (薄)         │ │                                 │ │ - 业务逻辑层 (厚)         │ │
│ │ - 转发给 MAIN world      │ │                                 │ │ - 操作 DOM/__vue__      │ │
│ └─────────────────────────┘ │                                 │ └─────────────────────────┘ │
└─────────────────────────────┘                                 └─────────────────────────────┘
           │                                                            │
           │ chrome.tabs.sendMessage                                  │
           │ (from Popup/Background)                                   │
           ▼                                                            │
    ┌─────────────────┐                                                 │
    │ Content Scripts │                                                 │
    │ (via Channel)   │                                                 │
    └─────────────────┘                                                 │
                                                                        │
                    页面 DOM / Vue 应用实例
                    (被操作的目标网页)
```

---

## 二、核心模块架构

### 2.1 Core 目录结构

```
src/core/
├── base/                              # 基础能力封装层
│   ├── index.ts                       # Base 类（所有模块的基类）
│   ├── http.ts                        # Axios HTTP 客户端实例
│   ├── proxy-http.ts                  # 代理 HTTP（通过 background 发起请求）
│   ├── storage.ts                     # Chrome Storage Local 封装
│   ├── messaging.ts                   # Chrome Runtime Message 封装
│   ├── tabs.ts                        # Chrome Tabs API 封装
│   ├── popup.ts                       # Popup 提示封装
│   └── channel/                       # 通道通信系统
│       ├── channel.ts                 # 类型定义（ChannelType, MessageType）
│       ├── channel-core.ts            # 核心 Channel 实现（单例模式）
│       ├── channel-bg.ts              # Background 端 Channel 实例
│       ├── channel-popup.ts           # Popup 端 Channel 实例
│       ├── channel-content.ts         # Content 端 Channel 实例
│       ├── channel-options.ts         # Options 端 Channel 实例
│       ├── channel-devtools.ts        # DevTools 端 Channel 实例
│       └── channel-index.ts           # Index 端 Channel 实例
│
├── cross-world-bridge.ts              # 跨 World 通信桥（ISOLATED ↔ MAIN）
├── module-registry.ts                 # 模块注册中心
├── version-checker.ts                 # 版本检测工具
├── interface.ts                       # 接口定义（IStorage, IPopup, ITabs 等）
└── demo.ts                            # 示例模块
```

### 2.2 核心组件详解

#### 2.2.1 ModuleRegistry（模块注册中心）

**职责**：统一管理所有业务模块的注册、路由生成、handler 初始化

```typescript
// 核心接口
interface IModule {
  name: string // 模块唯一标识
  label: string // 显示名称
  route?: { path; component } // Vue Router 配置（popup 类型需要）
  actionType?: 'popup' | 'tab' | 'devtools' | 'sidepanel'
  targetUrl?: string // 外部链接目标 URL
  icon?: string // Element Plus Icon 名称
  category?: string // 分组类别
  enabled: boolean // 是否启用
  registerContentHandlers?(): void // 注册 ISOLATED handler
  registerMainWorldHandlers?(): void // 注册 MAIN handler
}

// 核心方法
class ModuleRegistry {
  register(module: IModule): void // 注册模块
  getRoutes(): Array<{ path; name; component }> // 获取所有 popup 路由
  initContentHandlers(): void // 初始化所有模块的 ISOLATED handler
  initMainWorldHandlers(): void // 初始化所有模块的 MAIN handler
  getModules(): ModuleMeta[] // 获取模块元数据列表（供首页展示）
  getModule(name: string): IModule | undefined // 按名称获取原始模块
}
```

**使用流程**：

```typescript
// 1. 定义模块
const myModule: IModule = {
  name: 'my-module',
  label: '我的模块',
  actionType: 'popup',
  route: { path: '/my-module', component: () => import('./popup.vue') },
  registerContentHandlers: () => {
    /* ... */
  },
  registerMainWorldHandlers: () => {
    /* ... */
  }
}

// 2. 统一注册（src/modules/index.ts）
moduleRegistry.register(myModule)
```

---

#### 2.2.2 CrossWorldBridge（跨世界通信桥）

**背景**：Chrome Content Script 默认运行在 **ISOLATED world**，与页面 JS 隔离；Chrome 111+ 支持 `world: "MAIN"` 在新环境中运行。

**设计目标**：

- ISOLATED 端：拥有 `chrome.runtime.*` API 权限，负责 Channel 通信
- MAIN 端：可访问页面 `window.__vue__`、DOM，DevTools 可断点调试
- 通过 `postMessage` 建立双向通信，带安全校验防止伪造

```typescript
// 消息协议
interface CrossWorldMessage {
  source: 'cs-isolated' | 'cs-main'
  type: 'REQUEST' | 'RESPONSE' | 'HANDSHAKE' | 'PING_MAIN' | 'PONG'
  secret: string                    // 构建时注入的密钥 (__CROSS_WORLD_SECRET__)
  channel?: string                  // 业务通道名
  requestId?: string                // 请求 - 响应配对 ID
  payload?: any
  result?: any
  error?: string
}

// ISOLATED 端 API
await bridge.init(false)           // 初始化（非 MAIN 模式）
const result = await bridge.request<T>(channel, payload, timeout?)

// MAIN 端 API
await bridge.init(true)            // 初始化（MAIN 模式）
bridge.on(channel, async (payload) => {
  // 直接访问 __vue__、DOM
  return { list: [...] }
})
```

**握手流程**：

```
时间线：
══════════════════════════════════════════════════════════════
cs-isolated (ISOLATED)                cs-main (MAIN)
──────────────────                    ─────────────
加载完成                              加载完成
    │                                     │
    │  HANDSHAKE ──────────────────────►  │  收到，回应 HANDSHAKE
    │                                     │  setReady()
    │                                     │
    │  ◄────────────────────── HANDSHAKE  │
    │  setReady()                         │
    │                                     │
    │  (如果超时未收到回应，每 500ms 发 PING_MAIN)  │
    │                                     │
    │  PING_MAIN ──────────────────────►  │
    │  ◄────────────────────── PONG      │
    │  setReady()                         │
    │                                     │
    ▼                                     ▼
  双端就绪 ✓                           双端就绪 ✓
  开始处理业务请求
```

**安全校验（三层防御）**：

```
postMessage 事件
    │
    ├── 第 1 层：event.source === window          ← 只接受来自当前窗口的消息
    │
    ├── 第 2 层：event.data.secret === __CROSS_WORLD_SECRET__  ← 构建时注入的密钥
    │
    └── 第 3 层：event.data.source 匹配预期的发送方  ← 'cs-isolated' / 'cs-main'
```

---

#### 2.2.3 Channel（统一通讯通道）

**职责**：提供统一的异步消息通信机制，支持多种通信模式（单向、请求 - 响应、广播）

**支持的通信路径**：

- Background ↔ Popup
- Background ↔ Content Script
- Background ↔ DevTools
- Background ↔ Options
- Content ↔ Popup/Background（通过 `chrome.tabs.sendMessage`）

```typescript
// 创建 Channel 实例
const channelBg = Channel.getInstance(ChannelType.BACKGROUND)
const channelPopup = Channel.getInstance(ChannelType.POPUP)

// 注册消息处理器
channelBg.on('MY_CHANNEL', async (payload, from, sender) => {
  console.log(`收到来自 ${from} 的消息：`, payload)
  return { success: true }
})

// 单向发送（fire-and-forget）
await channelBg.send(ChannelType.POPUP, { data: 'hello' })

// 请求 - 响应模式
const result = await channelBg.request(ChannelType.CONTENT, { action: 'fetch' }, undefined, tabId)

// 监听并取消订阅
const unsubscribe = channelBg.on('MY_CHANNEL', handler)
unsubscribe() // 移除监听

// 广播
channelBg.broadcast({ event: 'theme-changed', theme: 'dark' })
```

**Channel 类型枚举**：

```typescript
enum ChannelType {
  BACKGROUND = 'background',
  POPUP = 'popup',
  CONTENT = 'content',
  OPTIONS = 'options',
  DEVTOOLS = 'devtools'
}
```

**消息类型枚举**：

```typescript
enum MessageType {
  CHANNEL_MESSAGE = 'CHANNEL_MESSAGE', // 单向消息
  CHANNEL_REQUEST = 'CHANNEL_REQUEST', // 请求 - 响应
  CHANNEL_RESPONSE = 'CHANNEL_RESPONSE', // 响应
  CHANNEL_PING = 'CHANNEL_PING', // 心跳探测
  CHANNEL_PONG = 'CHANNEL_PONG' // 心跳回应
}
```

---

#### 2.2.4 Base 类（模块基类）

**职责**：为所有业务模块提供统一的基础能力注入

```typescript
class Base {
  g_storage: IStorage // 本地存储
  g_popup: IPopup // 弹窗提示
  g_tabs: ITabs // 标签页管理
  g_messaging: IMessaging // 消息通信
  g_http: AxiosInstance // HTTP 客户端
  g_proxy_http: IProxyHttp // 代理 HTTP（通过 background）

  constructor() {
    // 自动注入所有能力
  }
}

// 使用示例
class MyModule extends Base {
  async fetchData() {
    // 直接使用注入的能力
    const data = await this.g_http.get('/api/data')
    await this.g_storage.set('cache', data)
    this.g_popup.success('获取成功')
  }
}
```

---

## 三、模块化设计

### 3.1 模块目录结构

```
src/modules/
├── index.ts                           # 模块统一注册入口
├── auto-fill-operator/                # 算子填充模块示例
│   ├── index.ts                       # 模块定义（IModule）
│   ├── content.ts                     # ISOLATED world handler（薄转发）
│   ├── main-world.ts                  # MAIN world handler（业务逻辑）
│   ├── fill/                          # 填充逻辑实现
│   │   ├── index.ts
│   │   ├── dialog.ts
│   │   ├── logic.ts
│   │   ├── styles.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── executor.ts
│   └── standalone/                    # 独立运行模式
│       ├── inject.ts
│       └── remove.ts
├── branch-handling/                   # 分支处理模块
│   ├── index.ts
│   ├── composables/
│   │   ├── use-token-storage.ts
│   │   ├── use-gitlab-api.ts
│   │   ├── use-gitlab-api-v1.ts
│   │   ├── use-branch-handling.ts
│   │   └── use-branch-cleanup.ts
│   └── types/
│       └── index.ts
├── release-helper/                    # 发布助手模块
│   ├── index.ts
│   ├── content.ts
│   ├── main-world.ts
│   ├── fill-release.ts
│   └── composables/use-release-storage.ts
└── dictionary-quick-reference/        # 字典速查模块
    ├── index.ts
    └── composables/use-dictionary.ts
```

### 3.2 模块开发模板

```typescript
// 1. 定义模块（modules/my-module/index.ts）
import type { IModule } from '../../core/module-registry'
import { registerContentHandlers } from './content'
import { registerMainWorldHandlers } from './main-world'

const myModule: IModule = {
  name: 'my-module',
  label: '我的模块名称',
  icon: 'IconName', // Element Plus Icon
  description: '模块描述文字',
  category: '分类名称', // 如"页面工具"
  enabled: true,
  actionType: 'popup', // 'popup' | 'tab' | 'devtools' | 'sidepanel'
  route: {
    path: '/my-module',
    component: () => import('./popup.vue') // 动态导入 Vue 组件
  },
  registerContentHandlers, // 可选：注册 ISOLATED handler
  registerMainWorldHandlers // 可选：注册 MAIN handler
}

export default myModule
```

```typescript
// 2. 注册模块（modules/index.ts）
import { moduleRegistry } from '../core/module-registry'
import myModule from './my-module'

moduleRegistry.register(myModule)
```

```typescript
// 3. ISOLATED world handler（modules/my-module/content.ts）
import channelContent from '../../core/base/channel/channel-content'
import { bridge } from '../../core/cross-world-bridge'

export function registerContentHandlers(): void {
  // 纯转发层：接收 Channel 消息后转发给 MAIN world
  channelContent.on('MY_ACTION', async payload => {
    return bridge.request('MY_ACTION', payload)
  })
}
```

```typescript
// 4. MAIN world handler（modules/my-module/main-world.ts）
import { bridge } from '../../core/cross-world-bridge'

export function registerMainWorldHandlers(): void {
  bridge.on('MY_ACTION', async payload => {
    // 直接访问页面数据，可断点调试
    const vue = document.querySelector('.xxx').__vue__
    return { success: true, data: vue.someData }
  })
}
```

```typescript
// 5. MAIN world 入口（content-scripts/cs-main.ts）
import { bridge } from '../core/cross-world-bridge'
import { registerMainWorldHandlers as myModuleRegister } from '../modules/my-module/main-world'

bridge.init(true).then(() => {
  myModuleRegister()
  // 后续新增模块在此添加一行 import + 调用即可
})
```

---

## 四、数据流图

### 4.1 Popup 到页面的完整数据流

```
┌──────────────┐
│   Popup UI   │
│  (HomePage)  │
└──────┬───────┘
       │ 1. 用户点击模块卡片
       ▼
┌──────────────┐
│  Router      │
│  (popup)     │
└──────┬───────┘
       │ 2. 路由跳转 /module/:moduleName
       ▼
┌──────────────┐
│ ModulePage   │
│  (动态渲染)   │
└──────┬───────┘
       │ 3. 模块内部发起操作请求
       ▼
┌──────────────┐
│  Channel     │
│  (Popup)     │
└──────┬───────┘
       │ 4. chrome.runtime.sendMessage
       ▼
┌──────────────┐
│ Background   │
│  (Service    │◄───► 5a. HTTP 代理 → OSS/后端 API
│   Worker)    │
└──────┬───────┘
       │ 6. chrome.tabs.sendMessage (指定 tabId)
       ▼
┌──────────────┐
│ cs-isolated  │
│ (ISOLATED)   │
│  (Content)   │
└──────┬───────┘
       │ 7. bridge.request() via postMessage
       ▼
┌──────────────┐
│ cs-main      │
│  (MAIN)      │
│  (Content)   │
└──────┬───────┘
       │ 8. bridge.on() 触发业务 handler
       ▼
┌──────────────┐
│   页面 DOM    │
│  / Vue 实例   │
└──────────────┘
```

### 4.2 版本检测流程

```
┌──────────────┐
│   Popup UI   │
│  (onMounted) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ VersionCheck │
│  (composable)│
└──────┬───────┘
       │ checkVersion()
       ▼
┌──────────────┐     fetch      ┌──────────────┐
│ getLocalVer- │───────────────►│   OSS        │
│ sion()       │                │  version.json│
└──────────────┘                └──────────────┘
       │                                │
       │ 比较版本号                     │ 返回最新版本信息
       ▼                                ▼
┌──────────────┐
│ isNewerVer-  │
│ sion()       │
└──────┬───────┘
       │
       ├─ 有更新 ───────────────────────┐
       │                                │
       ▼                                ▼
┌──────────────┐              ┌──────────────┐
│ 显示 Update  │              │ 无更新       │
│   Banner     │              │ 静默结束     │
└──────────────┘              └──────────────┘
       │
       │ 用户点击下载
       ▼
┌──────────────┐
│ 打开下载链接 │
│  (chrome.    │
│  downloads)  │
└──────────────┘
```

---

## 五、通信协议总结

### 5.1 通信方式对比

| 通信场景                | 通信方式                         | 方向 | 特点                      |
| ----------------------- | -------------------------------- | ---- | ------------------------- |
| Popup ↔ Background      | `chrome.runtime.sendMessage`     | 双向 | 同步请求 - 响应           |
| Background ↔ Content    | `chrome.tabs.sendMessage(tabId)` | 双向 | 需指定 tabId              |
| ISOLATED ↔ MAIN         | `postMessage` + Bridge           | 双向 | 跨 world 通信，带安全校验 |
| Background ↔ Background | 本地 Handler                     | 单向 | 同一上下文直接调用        |
| Channel 消息            | `Channel.send/request`           | 多向 | 统一抽象，支持多种目标    |

### 5.2 Channel 消息格式

```typescript
interface ChannelMessage {
  id: string // 消息唯一 ID（时间戳 + 随机数）
  type: MessageType // 消息类型
  from: ChannelType // 发送方类型
  to: ChannelType // 接收方类型
  channel?: string // 业务通道名
  payload: any // 消息载荷
  timestamp: number // 发送时间戳
}
```

---

## 六、关键设计模式

### 6.1 单例模式 (Channel)

```typescript
class Channel {
  private static instance: Channel
  static getInstance(type: ChannelType): Channel {
    if (!Channel.instance) {
      Channel.instance = new Channel(type)
    }
    return Channel.instance
  }
}
```

### 6.2 注册表模式 (ModuleRegistry)

```typescript
class ModuleRegistry {
  private modules = new Map<string, IModule>()
  register(module: IModule): void { ... }
  getModules(): ModuleMeta[] { ... }
}
```

### 6.3 门面模式 (Base)

```typescript
class Base {
  // 统一暴露底层能力
  g_storage, g_popup, g_tabs, g_http, g_proxy_http
}
```

### 6.4 策略模式 (Module Action Type)

```typescript
actionType: 'popup' | 'tab' | 'devtools' | 'sidepanel'
// 不同 actionType 对应不同的启动方式和生命周期
```

---

## 七、扩展性设计

### 7.1 新增模块步骤

1. **创建模块目录**：`src/modules/my-feature/`
2. **定义模块元数据**：`index.ts` 导出 `IModule` 对象
3. **实现业务逻辑**：
   - Popup 类型：编写 `popup.vue` 组件
   - Content 功能：编写 `content.ts` 和 `main-world.ts`
4. **注册模块**：在 `src/modules/index.ts` 中添加 `register()` 调用
5. **测试验证**：刷新 Popup 查看新模块卡片

### 7.2 配置化扩展

- **域名白名单**：修改 `manifest.json` 中 `content_scripts.matches`
- **UI 主题**：通过 `useTheme` composable 切换亮色/暗色主题
- **路由扩展**：在 `popup/router.ts` 中添加新路由
- **Channel 扩展**：新增 channel 类型需在 `ChannelType` 枚举中添加

---

## 八、性能优化策略

### 8.1 懒加载

```typescript
// Vue 组件动态导入
component: () => import('./popup.vue') // 仅在路由命中时加载

// 避免 MAIN world 将 Vue 等库打入 bundle
// cs-main.ts 只 import 纯 TS 业务逻辑
```

### 8.2 消息批处理

```typescript
// Channel 支持批量操作，减少消息往返次数
await channel.request('BATCH_UPDATE', [{ id: 1 }, { id: 2 }, { id: 3 }])
```

### 8.3 缓存策略

```typescript
// Storage 缓存常用数据
const cached = await this.g_storage.get('cache_key')
if (cached) return cached
const fresh = await this.g_http.get('/api/data')
await this.g_storage.set('cache_key', fresh)
```

---

## 九、安全设计

### 9.1 跨世界通信安全

- **三层校验**：source 检查 + secret 密钥 + source 类型匹配
- **构建时注入**：`__CROSS_WORLD_SECRET__` 由 webpack DefinePlugin 注入
- **仅接受窗口内消息**：`event.source !== window` 直接忽略

### 9.2 权限最小化

- **Manifest V3**：使用 Service Worker 而非持久后台页
- **按需权限**：仅声明必要的 permissions 和 host_permissions
- **域名白名单**：content_scripts 严格限定匹配域名

### 9.3 数据隔离

- **ISOLATED vs MAIN**：敏感操作在 ISOLATED 执行，页面操作在 MAIN 执行
- **Storage 隔离**：使用 `chrome.storage.local` 而非 shared storage

---

## 十、技术栈清单

| 层级        | 技术                               |
| ----------- | ---------------------------------- |
| UI 框架     | Vue 3 + Composition API            |
| 路由        | Vue Router (Hash 模式)             |
| UI 组件库   | Element Plus                       |
| 构建工具    | Webpack                            |
| 语言        | TypeScript                         |
| 样式        | SCSS                               |
| HTTP 客户端 | Axios                              |
| 状态管理    | Composables (自定义 hook)          |
| 扩展 API    | Chrome Extension API (Manifest V3) |

---

## 十一、文件索引

| 文件                                 | 说明                |
| ------------------------------------ | ------------------- |
| `src/core/module-registry.ts`        | 模块注册中心        |
| `src/core/cross-world-bridge.ts`     | 跨世界通信桥        |
| `src/core/base/`                     | 基础能力封装        |
| `src/core/base/channel/`             | 统一通讯通道        |
| `src/modules/index.ts`               | 模块统一注册入口    |
| `src/content-scripts/cs-isolated.ts` | ISOLATED world 入口 |
| `src/content-scripts/cs-main.ts`     | MAIN world 入口     |
| `src/background/index.ts`            | Service Worker 入口 |
| `src/popup/router.ts`                | Popup 路由配置      |
| `manifest.json`                      | 扩展配置文件        |

---

