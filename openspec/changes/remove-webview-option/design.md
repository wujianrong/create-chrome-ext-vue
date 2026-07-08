## Context

`hasWebview` 选项是早期遗留功能。模板目录中不存在 `src/webview/` 源码（如 `main.ts`、`index.html`），因此 `build/webpack.base.js.ejs` 中配置的 webview webpack entry 指向不存在的文件。用户选择此选项后生成的 webpack 配置会因找不到 entry 文件而失败。

此变更是纯粹的代码清理（Code Cleanup），不涉及新逻辑或架构调整。

## Goals / Non-Goals

**Goals:**
- 完全移除 CLI 交互式问答中的 Webview 选项
- 清理所有 `.ejs` 模板中的 `hasWebview` 条件渲染
- 清理类型定义中的 `hasWebview` 字段
- 清理模板文档中的 Webview 描述

**Non-Goals:**
- 不新增任何功能入口或替代方案
- 不影响 `hasTab`、`hasSidePanel`、`hasDevTools` 等其他选项

## Decisions

### 直接删除，不做向后兼容

`hasWebview` 选项指向不存在的源码文件，实际无法使用。直接删除所有相关代码，不需要兼容期。

### 涉及的文件（5 个文件）

| 文件 | 改动点 |
|------|--------|
| `src/questions.ts` | 删除 `group` 中 `webview` 选项；删除 `ScaffoldOptions.hasWebview`；删除返回对象中的 `hasWebview` |
| `src/index.ts` | 删除 `TemplateOptions.hasWebview`；删除 `templateOpts` 中的 `hasWebview` 传参 |
| `templates/manifest.json.ejs` | 删除 `<% if (hasWebview) { %>...<% } %>` 条件块（`webview/*` 资源声明） |
| `templates/build/webpack.base.js.ejs` | 删除 `pages` 对象中的 webview entry 配置块 |
| `templates/AGENTS.md` | 删除目录结构中的 `webview/` 行 |

## Risks / Trade-offs

- **已有使用过此选项生成的项目不受影响**：只是新生成的项目不再有 Webview 选项，已生成的项目已有对应的 webpack 配置和 manifest 声明，不受 CLI 工具更新影响。
- **manifest.json 中 `web_accessible_resources` 清空风险**：如果用户取消所有可选入口（SidePanel、Tab 也不启用），`resources` 数组可能为空。`templates/manifest.json.ejs` 当前已有此问题（非本次引入），不在本次变更范围内。
