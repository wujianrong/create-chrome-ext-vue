## ADDED Requirements

### Requirement: 多页面入口按输出目录深度配置 publicPath

webpack 多页面构建中,每个页面的 HtmlWebpackPlugin MUST 根据其 HTML 输出目录(`filename`)的嵌套深度独立配置 `publicPath`,确保注入的 `<script>` 和 `<link>` 资源路径能正确引用 dist 根目录下的构建产物。

- 一级子目录(如 `popup/`、`sidepanel/`、`devtools/`)的 publicPath SHALL 为 `'../'`。
- 二级子目录(如 `devtools/panel/`、`tab-app/`)的 publicPath SHALL 为 `'../../'`。

#### Scenario: Popup 页面的资源路径

- **WHEN** 用户构建项目,生成 `dist/popup/index.html`
- **THEN** HTML 中的 `<script>` 标签 src 为 `../popup.js`,浏览器加载时解析为 `dist/popup.js`
- **AND** 对应 chunk 的 CSS 文件引用路径同样使用 `'../'` 前缀

#### Scenario: SidePanel 页面的资源路径

- **WHEN** 用户构建项目,生成 `dist/sidepanel/index.html`
- **THEN** HTML 中的 `<script>` 标签 src 为 `../sidepanel.js`,浏览器加载时解析为 `dist/sidepanel.js`

#### Scenario: DevTools 入口页面的资源路径

- **WHEN** 用户构建项目,生成 `dist/devtools/index.html`
- **THEN** HTML 中的 `<script>` 标签 src 为 `../devtools.js`,浏览器加载时解析为 `dist/devtools.js`

#### Scenario: DevTools Panel 页面的资源路径

- **WHEN** 用户构建项目,生成 `dist/devtools/panel/index.html`
- **THEN** HTML 中的 `<script>` 标签 src 为 `../../devtoolsPanel.js`,浏览器加载时解析为 `dist/devtoolsPanel.js`
- **AND** Panel 页面在 Chrome DevTools 中打开后不再是空白页

#### Scenario: Tab App 页面的资源路径

- **WHEN** 用户构建项目,生成 `dist/tab-app/index.html`
- **THEN** HTML 中的 `<script>` 标签 src 为 `../../tabApp.js`,浏览器加载时解析为 `dist/tabApp.js`

### Requirement: DevTools Panel HTML 模板结构合法

`src/devtools/panel/index.html` 模板 MUST 符合标准 HTML5 结构,`<style>` 标签 SHALL 放置在 `<head>` 元素内部,禁止出现在 `</html>` 闭合标签之后。

#### Scenario: HTML 模板格式检查

- **WHEN** 查看 `src/devtools/panel/index.html` 源文件
- **THEN** `<style>` 标签位于 `<head>` 内(或至少不在 `</html>` 闭合标签之后)
- **AND** HTML 结构通过 HTML5 规范验证
