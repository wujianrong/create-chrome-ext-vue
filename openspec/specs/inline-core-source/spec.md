# inline-core-source

## Purpose

将 `@chrome-ext-vue/core` 的源码内联到生成的模板项目中，使用户可直接查看、修改、扩展基础设施代码，替代原有的 npm 依赖模式。

## Requirements

### Requirement: Core 源码内联到模板

生成的项目模板 MUST 在 `src/core/` 目录下包含 `@chrome-ext-vue/core` 的全部源代码（除 `global.d.ts` 外），用户可直接查看和修改基础设施代码。

#### Scenario: 生成项目后 src/core/ 目录存在

- **WHEN** 用户执行 `npm create chrome-ext-vue` 完成项目生成
- **THEN** `src/core/` 目录存在，包含所有 core 源码文件（index.ts、interface.ts、module-registry.ts、cross-world-bridge.ts、base/、channel/ 等）
- **AND** 文件内容与 `packages/core/src/` 保持一致

#### Scenario: 不复制 core 的 global.d.ts

- **WHEN** core 源文件被复制到模板
- **THEN** `src/core/global.d.ts` 不存在于生成的项目中
- **AND** `src/global.d.ts` 中已有的 `__CROSS_WORLD_SECRET__` 声明不受影响

### Requirement: Import 路径替换

所有模板文件中对 `@chrome-ext-vue/core` 的 import MUST 替换为 `@/core`，使用 webpack 已有的 `@` alias 解析。

#### Scenario: EJS 模板中的 import 路径

- **WHEN** 用户生成项目
- **THEN** 所有 `.ts`、`.vue`、`.ejs` 模板文件中的 `@chrome-ext-vue/core` import 全部替换为 `@/core`
- **AND** 替换后的路径可被 webpack `@` alias 正确解析到 `src/core/`

#### Scenario: TypeScript 类型导入

- **WHEN** 用户在 `.vue` 或 `.ts` 文件中使用 `import type { IModule, ModuleMeta } from '@/core'`
- **THEN** TypeScript 编译器可正确解析类型定义
- **AND** IDE 可提供自动补全和类型提示

### Requirement: Webpack 构建配置更新

生成的 webpack 配置 MUST 移除 `@chrome-ext-vue/core` 的 alias 配置，确保 core 源码通过 `@` alias 参与编译。

#### Scenario: 移除废弃的 alias

- **WHEN** 用户生成项目
- **THEN** `build/webpack.base.js` 中不存在 `@chrome-ext-vue/core` 相关的 alias 配置

#### Scenario: Core TypeScript 文件被编译

- **WHEN** 用户执行 `npm run build` 或 `npm run dev`
- **THEN** `src/core/` 下的 `.ts` 文件通过 babel-loader + `@babel/preset-typescript` 正常编译
- **AND** 构建产物功能与原有 npm 依赖方式一致

### Requirement: 移除 npm 依赖

生成的 `package.json` MUST 不包含 `@chrome-ext-vue/core` 依赖项。

#### Scenario: package.json 清理

- **WHEN** 用户生成项目
- **THEN** `package.json` 的 `dependencies` 中不含有 `@chrome-ext-vue/core`
- **AND** `npm install` 不会安装该包
