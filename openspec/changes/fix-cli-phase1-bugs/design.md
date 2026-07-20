## Context

`create-chrome-ext-vue` 是一个 Chrome Extension Vue 3 开发模板的 CLI 脚手架工具。当前 CLI 存在 5 个 Bug 和代码问题，影响文件生成正确性和用户体验。这些都是纯 Bug 修复，不涉及架构变更。

## Goals / Non-Goals

**Goals:**
- 修复 `copyDir` 中 `renderFile` 异步未等待的竞态条件
- 修复包管理器使用 `multiselect` 但语义为单选的交互错误
- 修复未启用目录仍被复制的死代码问题
- 修复 `manifest.json` 空 `web_accessible_resources` 输出
- 清理模板包中 3 个冗余依赖

**Non-Goals:**
- 不调整框架架构或 Channel 通信系统
- 不修改模板包的 Vue/Webpack 版本
- 不新增功能

## Decisions

### 1. `copyDir` 异步化方案

**选择**: 将 `copyDir` 改为 `async` 函数，使用 `ejs.renderFile` 的 Promise 形式（`util.promisify` 或 `ejs.renderFile` 直接不传回调时返回 Promise）。

`ejs.renderFile` 在不传回调参数时会返回 Promise，无需额外依赖：
```typescript
const content = await renderFile(srcPath, options, {})
writeFileSync(destPath, content, 'utf-8')
```

**备选**: 保持回调模式但用 `Promise` 包裹 → 更复杂，不选。

### 2. 包管理器单选

**选择**: 将 `multiselect` 替换为 `@clack/prompts` 的 `select` 组件，选项不变。

**备选**: 改用 `confirm` + 嵌套 `text` → 交互流程变长，不选。

### 3. 应用目录条件排除

**选择**: 在 `getExcludeDirs` 中新增对 `src/sidepanel/` 和 `src/tab-app/` 的条件判断：
- `!hasSidePanel` → 排除 `src/sidepanel`
- `!hasTab` → 排除 `src/tab-app`

这些目录是模板中的源码，在生成时应根据用户选择有条件地复制。

**备选**: 将这些目录也做成 `.ejs` 条件 → 会引入更多 EJS 模板化工作量，当前 Bug 修复不需要。

### 4. manifest.json 空 resources

**选择**: 用 EJS 条件 `<% if (hasTab || hasSidePanel) { %>` 包裹整个 `web_accessible_resources` 块，只有当至少有一个 web accessible 资源时输出。

**备选**: 添加一个占位空字符串 → 可能导致 Chrome 行为不一致，不选。

### 5. 模板包依赖清理

三处变更：
- `package.json.ejs`: 删除 `scss-loader`、`babel-plugin-lodash`、`glob`
- `webpack.base.js.ejs`: 删除 babel-loader 配置中的 `plugins: ['lodash']`
- `webpack.standalone.js`: 如果需要 `glob`，改为运行时提示用户手动安装或使用内置 `fs.readdirSync`

## Risks / Trade-offs

- **`copyDir` 异步化**: 当前同步版本 `readdirSync` 和 `copyFileSync` 不变，仅 EJS 渲染改为 `await`。递归调用的 `copyDir` 也需要 `await`。风险低，因为 `copyDir` 的调用者本身就在 `async action` 中。
- **目录排除**: `src/sidepanel/` 和 `src/tab-app/` 在模板中的相对路径固定，排除规则简单，不会误伤其他目录。
- **依赖删除**: 这三个依赖删除后向后兼容 — 新生成的项目不再包含它们。已生成的项目不受影响。
