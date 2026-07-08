## REMOVED Requirements

### Requirement: 用户可选择启用 Webview 独立页面

**Reason**: `hasWebview` 选项指向不存在的模板源码文件（`src/webview/main.ts`、`src/webview/index.html`），实际无法生成可用项目。选项本身是遗留无效功能。

**Migration**: 无需迁移。已有使用旧版 CLI 生成的项目不受影响。新项目如需独立 HTML 页面，可使用 `hasTab` 或 `hasSidePanel` 入口。

## ADDED Requirements

### Requirement: 交互式问答不包含 Webview 选项

系统在 `group` 交互式问答中 SHALL 不展示 "启用 Webview 独立页面？" 选项。

#### Scenario: 问答流程无 Webview 选项

- **WHEN** 用户运行 `create-chrome-ext-vue` 交互式问答
- **THEN** 提问列表中不包含 "启用 Webview 独立页面？"
- **AND** `ScaffoldOptions` 类型定义中不包含 `hasWebview` 字段

### Requirement: 模板文件不引用 hasWebview

系统 SHALL 在以下模板文件中移除所有 `hasWebview` 条件渲染：
- `templates/manifest.json.ejs` — `web_accessible_resources` 中的 `webview/*`
- `templates/build/webpack.base.js.ejs` — `pages` 对象中的 webview entry

#### Scenario: manifest.json 不包含 webview 相关资源声明

- **WHEN** 使用任意选项组合生成项目
- **THEN** 生成的 `manifest.json` 中 `web_accessible_resources` 不包含 `webview/*`

#### Scenario: webpack 配置不包含 webview 页面入口

- **WHEN** 使用任意选项组合生成项目
- **THEN** 生成的 `webpack.base.js` 中 `pages` 对象不包含 `webview` 条目

### Requirement: 模板文档不包含 Webview 目录描述

系统 SHALL 从 `templates/AGENTS.md` 的目录结构描述中移除 `webview/` 行。

#### Scenario: AGENTS.md 无 webview 目录行

- **WHEN** 生成新项目的 `AGENTS.md`
- **THEN** 目录结构段中不包含 `webview/` 描述
