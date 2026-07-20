## Why

CLI 脚手架存在 5 个导致文件生成不完整、用户交互错误、项目包含死代码的 Bug，影响用户首次体验。

## What Changes

- 修复 `copyDir` 中 EJS `renderFile` 异步未等待导致生成文件不完整的竞态条件
- 包管理器选择从 `multiselect` 改为 `select`，确保单选语义正确
- 未启用的应用目录（`src/sidepanel/`、`src/tab-app/`）在生成时条件排除，不再产生死代码
- `manifest.json.ejs` 模板中空 `web_accessible_resources` 数组在无 Tab/SidePanel 时不再输出
- 模板包清理 3 个冗余依赖：`scss-loader`（已被 `sass-loader` 覆盖）、`babel-plugin-lodash`（项目未依赖 lodash）、`glob`（仅在无条件复制的 standalone webpack 配置中使用）

## Capabilities

### New Capabilities
- `cli-scaffolding`: CLI 脚手架文件生成与交互流程的正确行为规范

### Modified Capabilities
<!-- 无现有 spec 被修改 -->
（无）

## Impact

- `packages/create-chrome-ext-vue/src/index.ts` — `copyDir` 异步改造 + 排除目录扩展
- `packages/create-chrome-ext-vue/src/questions.ts` — 包管理器交互组件变更
- `packages/template-vue3/manifest.json.ejs` — 条件排除空 resources
- `packages/template-vue3/package.json.ejs` — 清理冗余依赖
- `packages/template-vue3/build/webpack.base.js.ejs` — 移除 lodash babel 插件引用
