## Why

当前生成的项目模板中，`@chrome-ext-vue/core` 以 npm 依赖方式引入。用户能看到 `import { storage } from '@chrome-ext-vue/core'`，但不知道 core 提供了哪些 API、各组件之间如何协作、如何定制或扩展基础设施层。core 作为"黑盒"存在于 node_modules 中，用户无法查看源码，降低了模板的可用性和可维护性。

## What Changes

- **BREAKING**: 将 `@chrome-ext-vue/core` 的源码内联到生成的模板项目中（`src/core/` 目录），移除 npm 依赖
- 修改模板中的 import 路径，从 `@chrome-ext-vue/core` 改为本地路径 `@/core`
- 调整 webpack 构建配置，移除对 `@chrome-ext-vue/core` 的 alias 配置，确保 `@/core` 被正确编译
- 在生成的项目中新增 `docs/CORE_API.md` 文档，列出所有导出 API 的索引和简要说明
- 在生成的项目中新增 `docs/ARCHITECTURE.md` 架构文档，用图示说明 Channel、Bridge、ModuleRegistry 的协作关系

## Capabilities

### New Capabilities

- `inline-core-source`: 将 core 包源码合并到生成的项目模板中，用户可直接查看、修改、扩展基础设施代码
- `core-api-documentation`: 在生成的项目中提供 API 索引文档和架构说明文档，帮助用户快速了解所有可用能力

### Modified Capabilities

<!-- 无现有 spec 需要修改 -->

## Impact

- **模板文件**: `packages/create-chrome-ext-vue/templates/` 中新增 `src/core/` 目录及所有 core 源文件，新增 `docs/` 目录及文档文件
- **EJS 模板修改**: `src/modules/index.ts.ejs`、`src/popup/main.ts`、`src/popup/views/ModulePage.vue`、`src/background/index.ts`、`src/content-scripts/` 等文件的 import 路径需更新
- **构建配置**: `build/webpack.base.js.ejs` 中移除 `@chrome-ext-vue/core` alias，添加 `@/core` 的 TypeScript 路径映射
- **package.json 模板**: 移除 `@chrome-ext-vue/core` 依赖项
- **构建工具**: `packages/create-chrome-ext-vue/` 的 `copyDir()` 函数无需改动（已支持递归复制非 .ejs 文件）
- **非目标**: 不修改 `packages/core/` 自身（保留现有 npm 包，后续可另行决定是否废弃）
- **非目标**: 不修改 CLI 工具的交互逻辑或项目结构
