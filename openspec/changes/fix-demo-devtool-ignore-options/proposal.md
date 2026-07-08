## Why

使用 `npx create-chrome-ext-vue` 生成项目模板时，用户通过交互式问答选择"不生成 Demo 示例模块"和"不启用 DevTools 面板"后，`copyDir()` 函数仍无条件将所有非 `.ejs` 的模板文件复制到目标项目，导致 Demo 和 DevTools 相关源码文件被错误生成。

## What Changes

- **修复 `copyDir()` 函数**：新增基于 `TemplateOptions` 的条件过滤逻辑，当 `hasDemo` 为 `false` 时跳过 `demo`、`demo-devtools`、`demo-sidepanel`、`demo-tab` 及 `src/popup/views/demo/` 目录
- **子选项联动过滤**：`hasDemo` 为 `true` 但子选项（`hasDevTools`、`hasSidePanel`、`hasTab`）为 `false` 时，相应跳过 `demo-devtools`、`demo-sidepanel`、`demo-tab` 目录
- **清理孤儿文件**：移除 `templates/src/popup/views/demo/index.vue`，该文件未被任何模板代码引用

## Capabilities

### New Capabilities

- `template-option-filtering`: 生成项目模板时，根据用户选择的选项条件过滤应复制的文件/目录

### Modified Capabilities

<!-- 无现有 spec 被修改 -->

## Impact

- `packages/create-chrome-ext-vue/src/index.ts` — `copyDir()` 函数需增加条件过滤逻辑
- `packages/create-chrome-ext-vue/templates/src/popup/views/demo/index.vue` — 移除孤儿文件
