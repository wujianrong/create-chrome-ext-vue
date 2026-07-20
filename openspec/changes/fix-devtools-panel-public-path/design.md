## Context

当前 `packages/template-vue3/build/webpack.base.js.ejs` 使用 `HtmlWebpackPlugin` 为每个页面入口生成 HTML,并注入对应的 JS 和 CSS 资源。所有页面的 `publicPath` 统一硬编码为 `'../'`,目的是让 HTML 向上回退一层引用 dist 根目录下的资源。

实际运行时 HTML 嵌套深度不同:
- 一级子目录:`popup/`、`sidepanel/`、`devtools/` → `'../'` 正确回退到 `dist/` 根
- 二级子目录:`devtools/panel/`、`tab-app/` → `'../'` 只能回退到 `dist/devtools/` 或 `dist/tab-app/`,找不到根目录下的 JS 文件,404 导致页面空白

entry name 与 HTML 输出目录名之间也不完全一致(如 entry `tabApp` → 目录 `tab-app/`、entry `devtoolsPanel` → 目录 `devtools/panel/`),因此不能简单从 entry name 推导 publicPath。

## Goals / Non-Goals

**Goals:**
- 修复 `devtoolsPanel` 和 `tabApp` 两个入口的资源路径,使其生成正确的 script 引用
- 保持 popup、sidepanel、devtools 入口的现有行为不变
- 修复 `devtools/panel/index.html` 中 `<style>` 标签位于 `</html>` 之外的无效结构

**Non-Goals:**
- 不改动 webpack entry/output 的命名结构
- 不改动 manifest.json 中的页面路径配置
- 不调整 dist 目录的输出结构
- 不引入新的 webpack 插件或依赖

## Decisions

### 决策 1:按页面深度独立配置 publicPath(而非统一值)

**选择**:在 `pages` 对象中为每个 entry 增加 `publicPath` 字段,由其 HTML 输出目录(`filename`)的嵌套深度决定:
- 一级子目录(`popup/`、`sidepanel/`、`devtools/`):`publicPath: '../'`
- 二级子目录(`devtools/panel/`、`tab-app/`):`publicPath: '../../'`

**淘汰方案**:
| 方案 | 描述 | 淘汰原因 |
|------|------|----------|
| 统一改 output.filename 带目录前缀(如 `devtools/panel.js`) | 让 JS 输出到 HTML 同级目录 | 需改动 entry name 体系,影响多页面索引逻辑,改动面大 |
| 把所有 HTML 平铺到 dist 根目录 | 统一 publicPath 为空或 `'./'` | 破坏 manifest 中的路径约定,Chrome 扩展不允许 |

**权衡**:入口新增时开发者需要明确 publicPath 值,但这属于模板维护工作,且入口数量有限(popup、sidepanel、devtools、devtoolsPanel、tabApp 共 5 个),可接受。

### 决策 2:HTML 结构修复

`src/devtools/panel/index.html` 中 `<style>` 标签位于 `</html>` 闭合标签之后,浏览器虽能容忍但属于无效 HTML。将其移入 `<head>` 内,同时保留样式规则不变。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 新增页面入口但忘记配置 publicPath | 文档化 pages 对象约定;后续可考虑通过 filename 自动推导深度作为 fallback |
| tabApp 的 entry 名和 HTML 目录名不一致(`tabApp` vs `tab-app`) | 这是已有的命名约定,不需要本次修改;publicPath 由 filename 决定而非 entry 名 |
| 用户手动修改了生成的 webpack 配置并使用不同目录结构 | 超出修复范围;本次只修模板默认行为 |
