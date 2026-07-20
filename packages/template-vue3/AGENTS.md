# AGENTS.md – OpenSpec 全局约定

本文件为 OpenSpec 开发流程中的 AI 提供全局编码规范、架构约定和技术约束。每次创建 artifact 或执行 change 时均应遵循。

---

## 沟通语言

- 日常沟通必须使用中文，直奔主题，优先说明结论、改动和验证结果。
- 技术报错、异常名、API 名称、命令输出、库名、配置键、HTTP 状态码等保留英文原文。
- 如果出现错误，不要只翻译或概括；必须保留关键英文错误信息，方便用户复制到搜索引擎查询。
- 解释技术方案时可以中文为主，英文术语保留原名，例如 `ECharts`、`localStorage`、`setInterval`、`DOMContentLoaded`。
- 用户英文基础较弱，避免要求用户用英文补充需求；需要确认时用中文问一个关键问题即可。

## 技术栈

| 类别      | 技术                                                 |
| --------- | ---------------------------------------------------- |
| 平台      | Chrome Extension Manifest V3                         |
| 语言      | TypeScript (strict mode, ES2020)                     |
| UI 框架   | Vue 3 (Composition API + `<script setup lang="ts">`) |
| UI 组件库 | Element Plus                                         |
| 样式      | SCSS (scoped + 全局)                                 |
| HTTP      | Axios                                                |
| 构建      | Webpack 5                                            |
| 包管理    | npm                                                  |

---

## 工作规则

- 禁止自主决策开发行为，严格遵循 OpenSpec 流程执行开发任务
- 使用 OpenSpec 规范定义需求与变更⼯件
- 没有 OpenSpec change，不允许直接开始开发
- 不允许超出 `tasks.md` ⾃⾏扩需求
- 每完成⼀个⾥程碑，都必须运⾏相关检查
- 业务逻辑代码与视图展示代码分离（Business Logic 与 UI 解耦，便于单元测试和复用）
- 开发环境为 Windows 系统，所有脚本命令需兼容 Windows 环境

---

## 文件命名与目录规范

### 命名

| 类型           | 规范                          | 示例                                   |
| -------------- | ----------------------------- | -------------------------------------- |
| 文件           | kebab-case                    | `channel-core.ts`, `proxy-http.ts`     |
| 目录           | 小写单数                      | `channel/`, `types/`, `popup/`         |
| Vue 组件文件   | PascalCase                    | `App.vue`                              |
| 类             | PascalCase                    | `Channel`, `Base`, `BackgroundChannel` |
| 核心接口       | `I` 前缀 + PascalCase         | `IStorage`, `IChannel`, `IMessaging`   |
| 领域类型/接口  | PascalCase（无 `I` 前缀）     | `FieldConfig`, `FormConfig`            |
| 枚举           | PascalCase                    | `ChannelType`, `MessageType`           |
| 常量           | UPPER_SNAKE_CASE + `as const` | `STORAGE_KEYS`, `MESSAGE_TYPES`        |
| 函数/方法      | camelCase                     | `getInstance`, `sendToRuntime`         |
| Vue 事件处理器 | `handle` 前缀 + PascalCase    | `handleSave`, `handleGet`              |
| 私有类成员     | `_` 前缀                      | `_channel`, `_messageQueue`            |

### 目录结构

```
src/
├── background/        # Service Worker，常驻后台，完整 Chrome API 权限
├── content-scripts/   # 注入脚本，运行在目标页面隔离环境中
├── popup/             # 扩展弹窗 UI（Vue 3）
│   └── views/         # 页面视图组件
├── core/              # 核心能力封装
│   ├── interface.ts   # 核心接口定义（I 前缀）
│   ├── base/          # Chrome API 封装
│   │   ├── index.ts   # Base 组合类
│   │   ├── channel/   # 统一通信模块
│   │   ├── storage.ts # 本地存储
│   │   ├── tabs.ts    # 标签页管理
│   │   ├── messaging.ts    # 消息通信
│   │   ├── http.ts    # Axios 封装
│   │   ├── popup.ts   # 通知封装
│   │   └── proxy-http.ts   # Background 代理 HTTP
│   └── form-filler/   # 表单填充逻辑
└── types/             # 领域类型定义
    └── index.ts       # 类型桶文件
```

---

## 代码风格

### TypeScript

- 代码风格遵循 `.eslintrc.js` （继承 `standard` 规范）和`.prettierrc.js`，所有风格类规则由 ESLint 控制，不做额外手写约定
- 模块：**ES Module**，仅使用命名导入/导出
- 异步：优先使用 **async/await**
- 注释：使用**中文** JSDoc 和行内注释

### 导入规范

```typescript
// ✅ 正确：命名导入
import { ChannelType, ChannelMessage } from './channel'
import { ref, computed } from 'vue'

// ✅ 类型单独导入
import type { ChannelListener, Sender } from './channel'

// ✅ 桶文件再导出
export { ChannelType, MessageType } from './channel'
export type { ChannelMessage, ChannelOptions } from './channel'
```

### 导出规范

- 服务/工具类：**默认导出单例**
  ```typescript
  export default new Storage()
  export default new BackgroundChannel()
  ```
- 可继承的类：**默认导出类**
  ```typescript
  export default class Base { ... }
  ```
- 工具函数/常量：**命名导出**
  ```typescript
  export function createChannel() { ... }
  export const STORAGE_KEYS = { ... } as const
  ```
- 类型：**`export type`**
  ```typescript
  export type { ChannelMessage, ChannelOptions }
  ```

### Vue 组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const handleSave = async () => {
  // ...
}
</script>

<template>
  <!-- Element Plus 组件 -->
</template>

<style lang="scss" scoped>
// SCSS 样式
</style>
```

---

## 通信架构（关键）

Chrome 扩展是多进程架构，**Background 是通信中枢**，所有跨组件消息通过它路由。

### 各组件 Channel 实例

| 组件           | Channel 实例      | 说明         |
| -------------- | ----------------- | ------------ |
| Background     | `channelBg`       | 消息路由中心 |
| Popup          | `channelPopup`    | 用户交互界面 |
| Content Script | `channelContent`  | 页面注入脚本 |
| Options        | `channelOptions`  | 选项页面     |
| DevTools       | `channelDevTools` | 开发者工具   |

### 核心 API

- `on(channel, handler)` — 订阅消息
- `sendTo(target, payload)` — 单向发送
- `request(target, payload)` — 请求-响应模式
- `broadcast(payload)` — 广播给所有组件

**跨组件通信自动路由**：如 Popup → Content Script，自动通过 Background 中转。

---

## Base 类全局能力

`src/core/base/index.ts` 中的 `Base` 类提供扩展基础能力：

| 属性           | 功能                                    |
| -------------- | --------------------------------------- |
| `g_storage`    | 本地存储（`chrome.storage.local`）      |
| `g_tabs`       | 标签页管理                              |
| `g_messaging`  | 消息通信                                |
| `g_http`       | Axios HTTP 请求                         |
| `g_proxy_http` | 通过 Background 代理的 HTTP（解决跨域） |

---

## 关键约束（必须遵守）

1. **Popup 生命周期**：Popup 关闭后无法接收消息，重要操作（如数据持久化、网络请求）必须在 Background 中完成
2. **Content Script 隔离**：无法直接访问页面 JS 变量，需要额外注入脚本才能与页面上下文交互
3. **异步消息响应**：在 `chrome.runtime.onMessage` 中异步处理时，必须返回 `true` 以保持消息通道开放
4. **网络请求**：禁止直接使用 `fetch`/`XMLHttpRequest`，统一使用 `g_http` 或 `g_proxy_http`
5. **Service Worker 限制**：Background 作为 Service Worker 运行，不可访问 DOM，不可使用 `window` 对象
6. **Manifest V3**：不允许使用 `eval`、远程代码加载、阻塞式 webRequest

---

## OpenSpec 开发流程

### 创建 Change

使用 OpenSpec skill 相关命令创建新 change：

- 功能开发、Bug 修复、重构均通过 OpenSpec change 管理
- 每个 change 应包含：proposal（提案）、design（设计）、specs（规格）、tasks（任务）

### 实现 Change 时

- 严格遵循上述编码规范
- 新增文件需遵循目录结构约定
- 新增通信 channel 需在对应组件中注册
- 新增 Chrome API 封装需放入 `core/base/` 下
- 领域类型定义放入 `types/` 下

### 代码审查要点

- 是否正确使用了 Channel 通信而非直接 `chrome.runtime.sendMessage`
- 是否正确使用了 `g_http`/`g_proxy_http` 而非 `fetch`
- 异步消息处理是否返回了 `true`
- 是否考虑了 Popup 关闭后消息丢失的场景
