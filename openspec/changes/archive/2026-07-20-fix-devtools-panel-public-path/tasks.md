## 1. 修复 webpack 多页面 publicPath 配置

- [x] 1.1 在 `pages` 对象中为每个入口添加 `publicPath` 字段,一级子目录入口(`popup`、`sidepanel`、`devtools`)设为 `'../'`,二级子目录入口(`devtoolsPanel`、`tabApp`)设为 `'../../'`
- [x] 1.2 修改 `HtmlWebpackPlugin` 实例化代码,将硬编码的 `publicPath: '../'` 改为引用 `page.publicPath`

## 2. 修复 HTML 模板缺陷

- [x] 2.1 将 `src/devtools/panel/index.html` 中位于 `</html>` 之后的 `<style>` 标签移入 `<head>` 内部
- [x] 2.2 在 `src/devtools/panel/main.ts` 中添加 `import '../../modules'`,触发模块注册到 moduleRegistry,修复页面加载后提示"模块未找到或未配置组件"
- [x] 2.3 删除 `src/devtools/index.html` 中的 `<script src="index.js">`,避免 HtmlWebpackPlugin 保留该 script 导致 `devtools/index.js` 404
- [x] 2.4 将 `src/sidepanel/index.html` 中位于 `</html>` 之后的 `<style>` 标签移入 `<head>` 内部

## 3. 验证

- [x] 3.1 使用 CLI 生成一个新的模板项目(启用 DevTools + Demo + Tab)
- [x] 3.2 对生成的项目执行 `npm run build`,检查 `dist/devtools/panel/index.html` 中 script src 指向 `../../devtoolsPanel.js`,`dist/tab-app/index.html` 中 script src 指向 `../../tabApp.js`
- [x] 3.3 在 Chrome 扩展页面加载构建产物,打开 Demo DevTools 面板,确认页面不再空白且内容正常渲染
