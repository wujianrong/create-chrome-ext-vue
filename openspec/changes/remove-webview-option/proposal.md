## Why

CLI 交互式问答中的 "启用 Webview 独立页面？" 选项是无效的遗留功能 — 模板目录中不存在 `src/webview/` 源码文件，`webpack.base.js.ejs` 中引用的 webview entry 路径指向不存在的文件。保留此选项会给用户造成困惑。

## What Changes

- **移除 CLI 问答选项**：删除 `questions.ts` 中 "启用 Webview 独立页面？" 的交互式提问
- **移除类型定义**：`ScaffoldOptions` 和 `TemplateOptions` 中删除 `hasWebview` 字段
- **清洗 `.ejs` 模板**：移除 `manifest.json.ejs` 和 `webpack.base.js.ejs` 中的 `hasWebview` 条件渲染块
- **清洗模板文档**：`templates/AGENTS.md` 目录结构中移除 `webview/` 描述行

## Capabilities

### New Capabilities

- `remove-webview-option`: 清理无效的 Webview 入口选项及相关模板代码

### Modified Capabilities

<!-- 无现有 spec 被修改 -->

## Impact

| 文件 | 改动类型 |
|------|---------|
| `src/questions.ts` | 删除 webview 提问 + `hasWebview` 字段 |
| `src/index.ts` | 删除 `TemplateOptions.hasWebview` + 传参 |
| `templates/manifest.json.ejs` | 删除 `hasWebview` 条件渲染块 |
| `templates/build/webpack.base.js.ejs` | 删除 webview 页面入口配置块 |
| `templates/AGENTS.md` | 删除 `webview/` 目录描述行 |
