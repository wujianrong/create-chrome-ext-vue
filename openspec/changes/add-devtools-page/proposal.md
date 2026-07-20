## Why

当前模板项目已定义了 `actionType: 'devtools'` 模块类型,模块注册中心也支持 devtools 类型,但缺少对应的 DevTools 页面应用。demo-devtools 模块只有一个空的模块定义,无法真正运行。参考 popup、sidepanel、tab-app 三种页面类型都有完整的页面入口,DevTools 应该补齐这一能力。

## What Changes

- 新增 `src/devtools/` 页面应用目录,包含完整的 DevTools 入口脚本和面板页面
- 新增 DevTools 入口脚本 (`devtools/index.ts`),负责扫描已注册的 devtools 模块并调用 `chrome.devtools.panels.create()` 创建面板
- 新增 DevTools 面板页面 (`devtools/panel/`),参照 sidepanel 的动态加载模式,根据 URL 参数渲染对应模块组件
- 修改 Webpack 多页面构建配置 (`webpack.base.js.ejs`),为 devtools 页面添加构建入口
- 修改 Manifest 模板 (`manifest.json.ejs`),添加 `devtools_page` 配置字段
- 完善 `popup/utils/module-action.ts`,将 devtools case 的占位实现替换为有效逻辑
- 完善 `demo-devtools/demo-devtools/index.ts`,补充 `route` 和 `targetUrl` 配置
- 新增 DevTools 面板演示组件 (`DemoDevTools.vue`)

## Capabilities

### New Capabilities

- `devtools-page`: 提供完整的 Chrome DevTools 面板页面应用,包括管理层入口脚本和面板内容页,使 `actionType: 'devtools'` 类型的模块可以注册为独立的 DevTools 面板

### Modified Capabilities

（无）

## Impact

- **新增文件**: `src/devtools/index.html`, `src/devtools/index.ts`, `src/devtools/panel/index.html`, `src/devtools/panel/main.ts`, `src/devtools/panel/App.vue`, `src/devtools/panel/router.ts`, `src/devtools/composables/useTheme.ts`, `src/devtools/styles/theme-variables.scss`
- **新增文件**: `src/modules/demo-devtools/DemoDevTools.vue`
- **修改文件**: `build/webpack.base.js.ejs`, `manifest.json.ejs`, `src/popup/utils/module-action.ts`, `src/modules/demo-devtools/index.ts`
- **关联模块**: `module-registry.ts` 无需修改(deevtools actionType 已支持)
