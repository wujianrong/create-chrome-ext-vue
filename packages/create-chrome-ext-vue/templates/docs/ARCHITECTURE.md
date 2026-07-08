# 架构说明

本文档描述 `src/core/` 各组件的职责和协作关系。

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Chrome Extension                            │
│                                                                     │
│  ┌──────────┐   Channel    ┌──────────┐   Channel    ┌────────────┐│
│  │  Popup   │◄────────────►│Background│◄────────────►│  Options   ││
│  │  (Vue 3) │              │ (SW)     │              │  (Vue 3)   ││
│  │          │              │          │              │            ││
│  │ 使用:    │              │ 使用:    │              │ 使用:      ││
│  │ storage  │              │ http     │              │ storage    ││
│  │ registry │              │          │              │ registry   ││
│  │ channel  │              └────┬─────┘              │ channel    ││
│  └──────────┘                  │                    └────────────┘│
│                                 │ Channel                          │
│                                 │ (chrome.tabs.sendMessage)        │
│                                 ▼                                  │
│                      ┌───────────────────────┐                     │
│                      │    Content Script      │                     │
│                      │                       │                     │
│                      │  ┌─ ISOLATED world ─┐  │                     │
│                      │  │ 使用: registry    │  │                     │
│                      │  │       channel     │  │                     │
│                      │  │       bridge      │  │                     │
│                      │  └───────┬───────────┘  │                     │
│                      │          │ postMessage   │                     │
│                      │          ▼               │                     │
│                      │  ┌─ MAIN world ───────┐  │                     │
│                      │  │ 使用: bridge       │  │                     │
│                      │  │ 可访问: DOM/JS     │  │                     │
│                      │  └────────────────────┘  │                     │
│                      └───────────────────────┘                     │
│                                                                     │
│  ┌──────────┐              ┌──────────┐                            │
│  │ DevTools │  Channel     │ SidePanel│                            │
│  │ (Vue 3)  │◄────────────►│ (Vue 3)  │                            │
│  │ 使用:    │              │ 使用:    │                            │
│  │ registry │              │ registry │                            │
│  │ channel  │              │ channel  │                            │
│  └──────────┘              └──────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 组件分层

### 基础设施层（`src/core/base/`）

提供 Chrome Extension API 的 Promise 封装，所有组件均可使用：

| 模块 | 封装 API | 文件 |
|------|---------|------|
| `storage` | `chrome.storage.local` | `base/storage.ts` |
| `popup` | `chrome.notifications` | `base/popup.ts` |
| `tabs` | `chrome.tabs` | `base/tabs.ts` |
| `messaging` | `chrome.runtime.sendMessage/onMessage` | `base/messaging.ts` |
| `http` | Axios 实例工厂 | `base/http.ts` |
| `proxyHttp` | 通过 Background 代理的 HTTP | `base/proxy-http.ts` |
| `Base` | 聚合以上所有能力的门面类 | `base/index.ts` |

### 通信层（`src/core/base/channel/`）

统一的消息通道系统，支持 Background、Popup、Content Script、Options、DevTools 五方通信。

**Channel**（`channel-core.ts`）是核心实现：
- 单例模式，通过 `ChannelType` 适配不同上下文
- 支持单向发送（fire-and-forget）和请求-响应模式
- 内置消息路由逻辑（自动判断目标上下文和 Chrome API 调用方式）

**包装器**（`channel-bg.ts` / `channel-popup.ts` 等）为每种上下文提供便利方法：
- `channelPopup` 向 Content Script 发送时自动查询 activeTab
- `channelBg` 提供 `replyTo()` 和 `broadcast()` 方法

### 通信层（`src/core/cross-world-bridge.ts`）

**CrossWorldBridge** 解决 Content Script 中 ISOLATED world 和 MAIN world 的通信问题：
- ISOLATED world：可调用 Chrome API，但无法访问页面 DOM/JS
- MAIN world：可访问页面 DOM/JS，但无法调用 Chrome API
- Bridge 通过 `window.postMessage` + 安全密钥实现两者通信

### 模块层（`src/core/module-registry.ts`）

**ModuleRegistry** 是业务模块的中央管理：
- 注册模块定义（`IModule`）后，自动在 Popup 首页展示
- 根据 `actionType` 自动导航（popup 内跳转 / 打开新标签 / sidepanel / devtools）
- 集中管理 Content Script 的 ISOLATED 和 MAIN world 消息处理程序

---

## 典型通信流程

### 1. Popup → Content Script（Channel 通信）

```
┌──────────┐           ┌──────────────┐           ┌──────────────┐
│  Popup   │           │  Background  │           │Content Script│
│          │──(1)─────►│  (中继)       │──(2)─────►│              │
│ channel  │           │              │           │ channel      │
│ .request │◄──(4)─────│              │◄──(3)─────│ .on()        │
│          │           │              │           │              │
└──────────┘           └──────────────┘           └──────────────┘

步骤：
1. Popup 调用 channelPopup.request(ChannelType.CONTENT, payload, 'ACTION')
2. Channel 自动通过 chrome.tabs.sendMessage 发送到 Content Script
3. Content Script 中 channelContent.on('ACTION', handler) 接收并处理
4. 处理结果通过 sendResponse 返回给 Popup
```

### 2. ISOLATED → MAIN world（Bridge 通信）

```
┌───────────────────────────┐       ┌───────────────────────────┐
│   ISOLATED world          │       │   MAIN world              │
│   (Content Script)        │       │   (注入到页面)             │
│                           │       │                           │
│   bridge.request(         │       │   bridge.on(              │
│     'DEMO_ACTION',        │       │     'DEMO_ACTION',        │
│     payload               │       │     async (payload) => {  │
│   )                       │       │       return {            │
│                           │       │         title: doc.title  │
│         │                 │       │       }                   │
│         │  postMessage    │       │     }                     │
│         └────────────────►│       │         │                 │
│                           │       │         │                 │
│         ◄─────────────────│       │         │                 │
│         │  response       │       │         │                 │
└───────────────────────────┘       └───────────────────────────┘

安全校验（三层）：
1. event.source === window（只接收同窗口消息）
2. secret === __CROSS_WORLD_SECRET__（构建时注入的唯一密钥）
3. source 类型验证（期望 ISOLATED/MAIN 方向）
```

### 3. Demo 模块完整通信链路

以 `modules/demo/` 为例，展示 Popup → Channel → Bridge → MAIN 的三层通信：

```
Popup (popup.vue)                ISOLATED (content.ts)         MAIN (main-world.ts)
┌────────────────┐               ┌──────────────────┐         ┌────────────────────┐
│ channelPopup   │  Channel      │ channelContent   │ Bridge  │ bridge             │
│ .request(      │──────────────►│ .on('DEMO_TITLE',│────────►│ .on('DEMO_TITLE',  │
│   CONTENT, {}, │               │  async (p) => {  │         │  async (p) => {    │
│   'DEMO_TITLE' │               │    return bridge │         │    return {        │
│ )              │               │      .request(   │         │      title: ...    │
│                │◄──────────────│        'DEMO_..' │◄────────│    }               │
│                │   结果         │      , p)        │         │  })               │
│                │               │  })              │         │                    │
└────────────────┘               └──────────────────┘         └────────────────────┘
```

---

## 文件索引

```
src/core/
├── index.ts                    # 统一导出入口
├── interface.ts                # 核心接口定义（IStorage, IPopup, ITabs 等）
├── module-registry.ts          # 模块注册表
├── cross-world-bridge.ts       # 跨世界通信桥
├── base/
│   ├── index.ts                # Base 门面类
│   ├── storage.ts              # chrome.storage.local 封装
│   ├── popup.ts                # chrome.notifications 封装
│   ├── tabs.ts                 # chrome.tabs 封装
│   ├── messaging.ts            # chrome.runtime 消息封装
│   ├── http.ts                 # Axios 实例工厂
│   ├── proxy-http.ts           # 代理 HTTP 客户端
│   └── channel/
│       ├── channel.ts          # 类型定义
│       ├── channel-core.ts     # Channel 核心实现
│       ├── channel-index.ts    # 统一导出
│       ├── channel-bg.ts       # Background 通道
│       ├── channel-popup.ts    # Popup 通道
│       ├── channel-content.ts  # Content Script 通道
│       ├── channel-options.ts  # Options 通道
│       └── channel-devtools.ts # DevTools 通道
```
