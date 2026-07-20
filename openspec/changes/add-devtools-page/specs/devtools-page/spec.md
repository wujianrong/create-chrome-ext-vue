## ADDED Requirements

### Requirement: DevTools 入口页面自动注册面板

系统 SHALL 提供 DevTools 入口页面,在 Chrome DevTools 窗口打开时自动扫描已注册的 `actionType: 'devtools'` 类型模块,并为每个模块调用 `chrome.devtools.panels.create()` 创建对应的 DevTools 面板。

#### Scenario: 有 devtools 模块注册时创建面板

- **WHEN** 用户打开任意页面的 Chrome DevTools 窗口
- **AND** 扩展已在 `moduleRegistry` 中注册了 `actionType` 为 `devtools` 的模块
- **THEN** DevTools 窗口中出现对应模块名称的面板标签页
- **AND** 面板图标为扩展图标

#### Scenario: 无 devtools 模块时不创建面板

- **WHEN** 用户打开 Chrome DevTools 窗口
- **AND** `moduleRegistry` 中没有注册 `actionType` 为 `devtools` 的模块
- **THEN** DevTools 窗口中不出现扩展面板

### Requirement: DevTools 面板页面动态加载模块组件

系统 SHALL 提供 DevTools 面板内容页面,根据 URL 查询参数中的模块名称,动态加载该模块配置的 `route.component` 并渲染为 Vue 组件。

#### Scenario: 通过 URL 参数加载指定模块

- **WHEN** DevTools 面板页面 URL 为 `devtools/panel/index.html?module=demo-devtools`
- **AND** 模块 `demo-devtools` 已在 `moduleRegistry` 中注册
- **AND** 模块配置了有效的 `route.component`
- **THEN** 面板页面渲染该模块的 Vue 组件

#### Scenario: 模块未注册时显示错误

- **WHEN** DevTools 面板页面 URL 包含的模块名称未在 `moduleRegistry` 中注册
- **THEN** 面板页面显示错误提示信息

#### Scenario: 模块未配置组件时显示错误

- **WHEN** DevTools 面板页面 URL 包含的模块已注册但未配置 `route.component`
- **THEN** 面板页面显示"模块未配置组件"错误提示

### Requirement: Manifest 包含 devtools_page 配置

系统 SHALL 在 Chrome Extension 的 `manifest.json` 中配置 `devtools_page` 字段,指向 DevTools 入口页面。

#### Scenario: hasDevTools 选项启用时生成 devtools_page 配置

- **WHEN** 创建扩展项目时启用了 devtools 功能 (`hasDevTools: true`)
- **THEN** 生成的 `manifest.json` 包含 `"devtools_page": "devtools/index.html"`

#### Scenario: hasDevTools 选项禁用时不生成 devtools_page 配置

- **WHEN** 创建扩展项目时禁用了 devtools 功能 (`hasDevTools: false`)
- **THEN** 生成的 `manifest.json` 不包含 `devtools_page` 字段

### Requirement: Webpack 构建支持 DevTools 页面

系统 SHALL 在 Webpack 构建配置中为 DevTools 页面添加多页面构建入口,生成 `devtools/index.html`(管理层入口)和 `devtools/panel/index.html`(面板内容页)。

#### Scenario: 构建生成 DevTools 页面文件

- **WHEN** 执行 `webpack` 构建且 `hasDevTools` 选项为 `true`
- **THEN** `dist` 目录下生成 `devtools/index.js` 和 `devtools/index.html`
- **AND** `dist` 目录下生成 `devtools/panel/index.js` 和 `devtools/panel/index.html`

#### Scenario: 构建 chunk 隔离

- **WHEN** 构建 DevTools 入口页面
- **THEN** `devtools/index.js` 仅包含入口脚本代码
- **AND** Vue / Element Plus 相关代码仅在 `devtools/panel/index.js` 中出现

### Requirement: Popup 入口跳转 DevTools 面板页面

系统 SHALL 在用户在 Popup 页面中点击 `actionType` 为 `devtools` 的模块卡片时,将模块的 `targetUrl` 指向的 devtools/panel 页面在新标签页中打开。

#### Scenario: 点击 devtools 模块卡片

- **WHEN** 用户在 Popup 页面点击 `actionType` 为 `devtools` 且配置了 `targetUrl` 的模块卡片
- **THEN** 系统在新标签页中打开 `targetUrl` 对应的 devtools/panel 页面
- **AND** 用户也可在 Chrome DevTools 中通过同名面板访问相同页面

### Requirement: Demo DevTools 模块配置完整

系统 SHALL 为 `demo-devtools` 模块补充 `route.component` 和 `targetUrl` 配置,使其可以被 DevTools 面板页面正确加载和渲染。

#### Scenario: demo-devtools 模块包含路由配置

- **WHEN** `moduleRegistry` 中查询 `demo-devtools` 模块
- **THEN** 模块包含 `route` 属性,其中 `path` 为 `/demo-devtools`
- **AND** 模块包含 `targetUrl` 属性,值为 `devtools/panel/index.html?module=demo-devtools`
- **AND** 模块的 `route.component` 指向 `DemoDevTools.vue` 组件
