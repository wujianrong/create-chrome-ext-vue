## 1. 清理 CLI 源码

- [x] 1.1 从 `src/questions.ts` 中移除 webview 提问选项、`ScaffoldOptions.hasWebview` 字段及返回值
- [x] 1.2 从 `src/index.ts` 中移除 `TemplateOptions.hasWebview` 字段及 `templateOpts` 传参

## 2. 清理模板 .ejs 文件

- [x] 2.1 从 `templates/manifest.json.ejs` 中移除 `<% if (hasWebview) { %>...<% } %>` 块
- [x] 2.2 从 `templates/build/webpack.base.js.ejs` 中移除 `pages` 对象中的 webview entry 配置块

## 3. 清理模板文档

- [x] 3.1 从 `templates/AGENTS.md` 目录结构中移除 `webview/` 描述行

## 4. 编译验证

- [x] 4.1 执行 `npm run build` 编译 CLI 包，确认无编译错误
- [x] 4.2 全局搜索确认无残留的 `hasWebview` 引用
