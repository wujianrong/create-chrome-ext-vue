## Context

当前项目架构中,poup、sidepanel、tab-app 三种页面类型各有完整的独立页面应用。devtools 类型在模块注册系统中预留了接口,但缺少实际的页面实现。Chrome Extension DevTools API 天然需要两层入口:

1. **管理层脚本** (`devtools_page`)：在 DevTools 窗口打开时执行,负责调用 `chrome.devtools.panels.create()` 创建面板
2. **面板内容页** (`panel.html`)：面板内实际展示的 HTML 页面,运行 Vue 应用

### 现有架构参照

```
src/
├── popup/            ← 独立 SPA (main.ts + router + App.vue)
├── sidepanel/        ← 组件加载器 (main.ts → App.vue 动态加载模块组件)
├── tab-app/          ← 独立 SPA (main.ts + router + App.vue)
└── (devtools/)       ← 待实现
```

sidepanel 的动态加载模式最为接近 devtools 面板的需求:
- 从 storage 读取当前模块名
- 通过 `moduleRegistry.getModule()` 获取模块配置
- 动态加载 `module.route.component` 并渲染

## Goals / Non-Goals

**Goals:**

- 补齐 `src/devtools/` 页面应用,使 `actionType: 'devtools'` 类型模块可被渲染为 Chrome DevTools 面板
- DevTools 入口脚本自动扫描已注册的 devtools 模块并创建对应面板
- 面板页面参考 sidepanel 模式,根据 URL 参数动态加载模块组件
- Webpack 构建配置增加 devtools 页面入口
- Manifest 模板增加 `devtools_page` 配置
- Popup 入口逻辑对 devtools 模块提供合理的用户引导

**Non-Goals:**

- 不在 DevTools 面板内提供模块切换功能(每模块一个独立面板,由 Chrome DevTools Tab Bar 切换)
- 不修改 devtools 之外已有页面或模块
- 不引入新的第三方依赖
- 不实现 DevTools 面板与 Background/Content Script 之间的新通信协议(复用已有 Channel 体系)

## Decisions

### 决策 1：两层页面架构

```
src/devtools/
├── index.html              # DevTools 入口页面 (管理层)
├── index.ts                # 入口脚本：扫描模块 → chrome.devtools.panels.create()
├── panel/
│   ├── index.html           # 面板内容页 (展示层)
│   ├── main.ts              # Vue 应用挂载入口
│   ├── router.ts            # 路由配置
│   └── App.vue              # 动态加载模块组件 (参照 sidepanel/App.vue)
├── composables/
│   └── useTheme.ts          # 主题管理 (复制自 sidepanel/tab-app)
└── styles/
    └── theme-variables.scss  # CSS 变量 (复制自 sidepanel/tab-app)
```

- **为何不用单页面**: Chrome DevTools API 要求 `chrome.devtools.panels.create()` 中的 `setPage()` 指定独立 HTML 页面地址,无法在 devtools_page 内直接渲染 Vue 应用
- **为何不合并管理脚本和面板**: 管理层运行在 devtools 作用域,面板运行在 iframe 沙箱,两者无法共享同一个 HTML

### 决策 2：模块到面板的映射策略

**选择：每模块一个独立 DevTools 面板**

入口脚本 (`devtools/index.ts`) 遍历 `moduleRegistry.getModules()`,筛选 `actionType === 'devtools'` 的模块,为每个模块调用 `chrome.devtools.panels.create()`:

```typescript
// devtools/index.ts 伪代码
import { moduleRegistry } from '@/core'

moduleRegistry.getModules()
  .filter(m => m.actionType === 'devtools')
  .forEach(module => {
    chrome.devtools.panels.create(
      module.label,
      '/assets/images/icon.png',
      `devtools/panel/index.html?module=${module.name}`
    )
  })
```

**备选方案**: 单一共享面板,面板内部用 Tab 切换模块 → 不符合 Chrome DevTools 用户习惯,且与每个模块独立面板的 Chrome Web Store 惯例不一致

### 决策 3：面板页面架构

**选择：组件加载器模式（参照 sidepanel）**

`devtools/panel/App.vue`:
1. 从 URL `?module=xxx` 读取模块名
2. 通过 `moduleRegistry.getModule()` 获取模块的 `route.component`
3. 如果 `component` 为 Promise,await 动态加载;否则直接使用
4. 渲染 `<component :is="ModuleComponent" />`

面板页面不需要完整的 Vue Router 导航系统,因为每个面板只显示一个模块,模块切换由 Chrome DevTools 的 Tab Bar 完成。

### 决策 4：Popup 入口逻辑

**选择：在新标签页中打开 devtools/panel 页面（同 tab 行为）**

Chrome Extension 无法通过 JavaScript API 以编程方式打开 DevTools 面板。但 devtools/panel 页面可以通过 `chrome-extension://[id]/devtools/panel/index.html` 直接访问:

1. 点击 devtools 模块卡片时,调用 `chrome.tabs.create({ url: module.targetUrl })` 在新标签页中打开面板页面
2. 同一页面也可通过 F12 → DevTools 中的同名面板访问(devtools_page 入口脚本会自动创建)
3. 行为与 `tab` 类型模块一致,减少用户学习成本
### 决策 5：Webpack 构建入口

**选择：两个独立 entry + 两个 HTML 模板**

```javascript
// webpack.base.js.ejs 新增
<% if (hasDevTools) { %>,
  devtools: {
    entry: path.resolve(__dirname, '../src/devtools/index.ts'),
    template: path.resolve(__dirname, '../src/devtools/index.html'),
    filename: 'devtools/index.html',
    title: 'DevTools'
  },
  devtoolsPanel: {
    entry: path.resolve(__dirname, '../src/devtools/panel/main.ts'),
    template: path.resolve(__dirname, '../src/devtools/panel/index.html'),
    filename: 'devtools/panel/index.html',
    title: 'DevTools Panel'
  }
<% } %>
```

**为何不用 Vite**: 当前项目使用 Webpack 构建体系,与其他页面保持一致

### 决策 6：复用主题系统

**选择：复制 `useTheme.ts` 和 `theme-variables.scss`**

三个已有页面 (sidepanel/popup/tab-app) 各自维护了一份 `useTheme.ts` 和样式文件,devtools 沿用相同模式。虽然存在代码重复,但统一提取为共享模块属于独立的重构任务,不在本次变更范围内。

## Risks / Trade-offs

- **运行时开销**: 每个 devtools 面板加载一个独立的 Vue 应用实例(含 Element Plus),Chrome DevTools 面板默认是延迟加载(用户切换 Tab 时才加载 iframe),实际开销可控
- **模块数量上限**: Chrome DevTools 支持多个面板同时注册,但过多的面板可能使 DevTools Tab Bar 拥挤。当前 demo 阶段只有 1 个示例模块,风险低。建议后续添加文档说明建议的 devtools 面板数量上限
- **调试环境差异**: DevTools 面板在 DevTools 的隔离扩展上下文中运行,与 Popup 的扩展弹出窗口上下文不同。现有 Channel 体系 (`channel-devtools.ts`) 已预留 devtools 通信通道,本次变更仅涉及页面展示,不涉及通信链路实现
- **Webpack chunks 不会自动分离**: devtools 入口和管理脚本共享同一 chunk,可能导致 `chrome.devtools.panels.create()` 所在的入口脚本文件包含 Vue 代码。需要在 HtmlWebpackPlugin 中正确配置 `chunks` 字段隔离入口的依赖

## Open Questions

1. devtools 页面是否需要与 Background 通信?(当前无需求,后续可通过 `channel-devtools` 扩展)
2. demo-devtools 页面展示什么演示内容?(建议展示一个简单的 JSON 查看器或性能信息面板)
