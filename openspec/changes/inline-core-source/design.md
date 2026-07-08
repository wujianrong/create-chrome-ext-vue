## Context

当前 `create-chrome-ext-vue` 脚手架生成的项目模板中，`@chrome-ext-vue/core` 作为 npm 依赖从 `node_modules` 加载。该依赖提供了 Channel 通信、ModuleRegistry 模块管理、CrossWorldBridge 跨世界通信、storage/tabs/popup/messaging/http 等基础设施封装。由于代码在 node_modules 编译产物中，用户无法查看源码、了解完整 API 面，也不便于定制扩展。

`packages/create-chrome-ext-vue/templates/` 是 EJS 模板目录，`copyDir()` 递归处理：`.ejs` 文件用 EJS 渲染，其他文件原样复制。这天然支持将 core 源码直接放入模板目录。

## Goals / Non-Goals

**Goals:**
- 将 `@chrome-ext-vue/core` 源码以 `src/core/` 目录形式放入生成的项目模板
- 替换所有模板文件中的 `@chrome-ext-vue/core` import 为本地 `@/core` 路径
- 调整 webpack 构建配置，确保 core 源码被正确编译
- 生成 `docs/CORE_API.md`（API 索引）和 `docs/ARCHITECTURE.md`（架构文档）帮助用户快速了解所有可用能力

**Non-Goals:**
- 不修改 `packages/core/` 源码（保留 npm 包供可能的其他用途）
- 不修改 CLI 交互流程或项目目录结构
- 不改变 core 的功能行为或 API 签名
- 不在生成后的项目中保留 npm 引用

## Decisions

### 1. 源码放置位置：`templates/src/core/`

将 `packages/core/src/` 下的所有源文件复制到模板目录 `templates/src/core/`。core 内部模块之间的相对 import 保持不变，因为目录结构完全一致。

**排除 `global.d.ts`**: core 的 `src/global.d.ts` 仅声明 `__CROSS_WORLD_SECRET__`，模板 `src/global.d.ts` 已有相同声明，无需重复。

### 2. Import 路径策略：`@chrome-ext-vue/core` → `@/core`

现有 webpack 已将 `@` 别名为 `src/`（webpack.base.js.ejs:69），因此 `@/core` 自然解析为 `src/core/`。所有模板文件中的 import 路径统一替换：

```
@chrome-ext-vue/core  →  @/core
```

涉及的文件（共约 15 处 import）：

| 文件 | 当前导入 | 改为 |
|------|---------|------|
| `src/background/index.ts` | `createHttpInstance` | 不变（仅改路径） |
| `src/content-scripts/cs-isolated.ts` | `moduleRegistry, bridge` | 不变 |
| `src/content-scripts/cs-main.ts` | `moduleRegistry, bridge` | 不变 |
| `src/modules/index.ts.ejs` | `moduleRegistry` | 不变 |
| `src/popup/main.ts` | `storage` | 不变 |
| `src/popup/composables/useTheme.ts` | `storage` | 不变 |
| `src/popup/views/HomePage.vue` | `moduleRegistry`, `ModuleMeta` | 不变 |
| `src/popup/views/ModulePage.vue` | `moduleRegistry`, `ModuleMeta` | 不变 |
| `src/popup/components/CardGrid.vue` | `ModuleMeta` | 不变 |
| `src/popup/components/ModuleCard.vue` | `ModuleMeta` | 不变 |
| `src/popup/components/TreeMenu.vue` | `ModuleMeta` | 不变 |
| `src/popup/utils/module-action.ts` | `ModuleMeta` | 不变 |
| `src/tab-app/views/ModulePage.vue` | `moduleRegistry`, `IModule` | 不变 |
| `src/tab-app/composables/useTheme.ts` | `storage` | 不变 |
| `src/sidepanel/App.vue` | `moduleRegistry`, `IModule` | 不变 |
| `src/modules/demo/*.ts` | 各种 export | 不变 |
| `src/modules/demo/*.vue` | 各种 export | 不变 |
| `src/modules/demo-tab/*` | `IModule`, `Base` | 不变 |
| `src/modules/demo-sidepanel/*` | `IModule` | 不变 |
| `src/modules/demo-devtools/*` | `IModule` | 不变 |

### 3. Webpack 配置变更

**删除** `@chrome-ext-vue/core` alias（webpack.base.js.ejs:70）：
```js
// 删除这一行
'@chrome-ext-vue/core': path.resolve(__dirname, '../node_modules/@chrome-ext-vue/core/dist')
```

**保留** `@` alias 不变（已指向 `src/`），`@/core` 自动解析。

由于 core 源码是 TypeScript，模板中已有 `babel-loader` + `@babel/preset-typescript` 处理 `.ts` 文件，core 中的 `.ts` 文件无需额外配置即可编译。

### 4. package.json 模板变更

在 `templates/package.json.ejs` 中移除 `@chrome-ext-vue/core` 依赖行。core 的 peerDependencies（vue、vue-router、axios）已在生成的 package.json 中作为其他依赖存在，不会缺失。

### 5. 文档生成

在模板中新增 `docs/` 目录，包含两个纯 Markdown 文件（非 .ejs，直接复制）：

**`docs/CORE_API.md`** — API 快速索引
- 按功能分类列出所有导出（基础设施层、通信层、模块层）
- 每个 API 包含简短说明和使用示例
- 列表形式，方便查阅

**`docs/ARCHITECTURE.md`** — 架构全景
- ASCII 图示说明 Channel、Bridge、ModuleRegistry 协作关系
- 通信流程图（Popup → Content Script → Bridge → MAIN world）
- 各组件职责概述

### 6. 文件复制策略

core 源文件不加 `.ejs` 后缀，`copyDir()` 会将它们原样复制到生成的项目中。EJS 模板文件（如 `index.ts.ejs`）正常渲染，Import 路径在 EJS 渲染前已设为 `@/core`，无需运行时替换。

## Risks / Trade-offs

- **[重复代码]**: 每个生成的项目都有 core 源码副本 → 可接受，这是脚手架的常规做法（如 create-react-app 的 src/ 模板）
- **[core 更新不自动传播]**: 用户生成的旧项目不会自动获取 core 改进 → 通过 CHANGELOG 或版本说明文档告知用户更新方式
- **[用户可能误改 core 代码]**: 用户修改基础设施代码导致不稳定 → ARCHITECTURE.md 中标注"修改需谨慎"，core 代码本身注释完善，帮助用户理解后再改
- **[TypeScript 无需额外配置]**: tsconfig 已 `include: ["src/**/*"]`，涵盖 `src/core/` → 无风险
- **[core 的 `global.d.ts` 与模板的 `global.d.ts` 重复]**: 声明相同类型 → 排除 core 的 `global.d.ts`，不复制到模板
