## 1. DevTools 页面应用脚手架

- [x] 1.1 创建 `src/devtools/index.html`（管理层入口 HTML 模板）
- [x] 1.2 创建 `src/devtools/index.ts`（管理层入口脚本：遍历 devtools 模块 → `chrome.devtools.panels.create()`）
- [x] 1.3 创建 `src/devtools/panel/index.html`（面板内容 HTML 模板）
- [x] 1.4 创建 `src/devtools/panel/main.ts`（面板 Vue 应用挂载入口）
- [x] 1.5 创建 `src/devtools/panel/router.ts`（面板路由配置，/module/:moduleName）
- [x] 1.6 创建 `src/devtools/panel/App.vue`（面板动态模块加载器，参考 sidepanel/App.vue）
- [x] 1.7 创建 `src/devtools/composables/useTheme.ts`（主题管理，复制 sidepanel/tab-app 模式）
- [x] 1.8 创建 `src/devtools/styles/theme-variables.scss`（CSS 变量，复制 sidepanel/tab-app 模式）

## 2. Demo DevTools 模块完善

- [x] 2.1 创建 `src/modules/demo-devtools/DemoDevTools.vue`（DevTools 面板演示组件）
- [x] 2.2 修改 `src/modules/demo-devtools/index.ts`（补充 `route.component` 和 `targetUrl`）

## 3. 构建配置更新

- [x] 3.1 修改 `build/webpack.base.js.ejs`（添加 devtools 和 devtoolsPanel 两个页面入口，配置 chunk 隔离）
- [x] 3.2 修改 `manifest.json.ejs`（添加 `devtools_page` 配置，并在 `web_accessible_resources` 中添加 devtools 相关路径）

## 4. Popup 入口逻辑完善

- [x] 4.1 修改 `src/popup/utils/module-action.ts`（将 devtools case 的 console.log 占位替换为 ElMessage 引导提示）
- [x] 4.2 修改 `src/popup/main.ts`（确保 Element Plus 的 ElMessage 全局引入，如未引入则补充）

## 5. 验证

- [x] 5.1 运行 `npm run build` 或 `yarn build`，确认构建无报错
- [x] 5.2 检查 `dist` 目录，确认包含 `devtools/index.html`、`devtools/index.js`、`devtools/panel/index.html`、`devtools/panel/index.js`
- [x] 5.3 检查 `dist/manifest.json`，确认包含 `"devtools_page": "devtools/index.html"`
- [x] 5.4 检查 ESLint 校验通过
