## Why

通过 CLI 生成的模板项目,启用 DevTools + Demo 后访问 Demo DevTools 面板页面是空白的。根因是 `webpack.base.js.ejs` 中所有 HtmlWebpackPlugin 实例共用 `publicPath: '../'`,但对 HTML 输出在二级子目录(如 `devtools/panel/`、`tab-app/`)的入口,`../` 只回退一层,导致注入的 `<script src="../xxx.js">` 解析到不存在的路径,JS 加载 404,Vue 应用不挂载,页面空白。这是一个阻断性的构建产物缺陷,用户按默认选项生成的项目开箱即坏。

## What Changes

- 修复 `webpack.base.js.ejs` 中 HtmlWebpackPlugin 的 `publicPath` 配置:不再对所有页面硬编码 `'../'`,而是按 HTML 输出目录的嵌套深度动态计算(一级子目录用 `'../'`,二级子目录用 `'../../'`)。
- 受影响入口:`devtoolsPanel`(输出到 `devtools/panel/index.html`)和 `tabApp`(输出到 `tab-app/index.html`)。其他入口(`popup`、`sidepanel`、`devtools`)路径不变,行为不受影响。
- 修复 `src/devtools/panel/index.html` 模板中 `<style>` 标签位于 `</html>` 之外的无效 HTML 结构,将其移入 `<head>`。

## Capabilities

### New Capabilities

- `multi-page-asset-paths`: 定义 webpack 多页面构建中,各页面 HtmlWebpackPlugin 资源路径(publicPath)的解析规则,确保任意嵌套深度的 HTML 输出都能正确引用构建产物中的 JS/CSS 资源。

### Modified Capabilities

<!-- 本次不修改任何现有 capability 的 spec 级别要求 -->

## Impact

- **受影响代码**:`packages/template-vue3/build/webpack.base.js.ejs`(核心修改)、`packages/template-vue3/src/devtools/panel/index.html`(HTML 结构修复)。
- **受影响功能**:CLI 生成模板时选择 DevTools 或 Tab 页面类型的用户,构建产物的 script 引用路径将变为正确,页面可正常加载。
- **不受影响**:popup、sidepanel、devtools 入口页面的资源路径保持原状;运行时逻辑、模块注册、manifest 配置均不改动。
- **验证方式**:生成一个启用 DevTools + Demo 的模板项目,执行 `npm run build`,检查 `dist/devtools/panel/index.html` 中的 script src 指向 `../../devtoolsPanel.js`,并在 Chrome 扩展页面加载该 panel 确认不再是空白页。
