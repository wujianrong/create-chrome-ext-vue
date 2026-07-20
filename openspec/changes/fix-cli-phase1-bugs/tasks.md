## 1. 修复 copyDir 异步渲染问题

- [ ] 1.1 将 `copyDir` 函数改为 `async`，递归调用添加 `await`
- [ ] 1.2 `.ejs` 文件渲染改用 `await renderFile()` Promise 形式，移除回调
- [ ] 1.3 确认 `run()` 中的 `copyDir()` 调用已添加 `await`

## 2. 修复包管理器单选交互

- [ ] 2.1 将 `multiselect` 导入替换为 `select`
- [ ] 2.2 包管理器选择逻辑改为单选返回值，移除 `pkgChoice[0]` 取第一个值的 hack
- [ ] 2.3 确认选项和 `ScaffoldOptions.packageManager` 类型匹配

## 3. 条件排除未启用应用目录

- [ ] 3.1 在 `getExcludeDirs` 中新增对 `src/sidepanel` 和 `src/tab-app` 的条件排除
- [ ] 3.2 验证 `!hasSidePanel` 和 `!hasTab` 场景下对应目录不被复制

## 4. 修复 manifest.json 空 web_accessible_resources

- [ ] 4.1 在 `manifest.json.ejs` 中用 `<% if (hasTab || hasSidePanel) { %>` 包裹整个 `web_accessible_resources` 块
- [ ] 4.2 清理模板中 `hasTab` 和 `hasSidePanel` 为 false 时的尾随逗号问题

## 5. 清理模板包冗余依赖

- [ ] 5.1 从 `package.json.ejs` 的 `devDependencies` 中移除 `scss-loader`
- [ ] 5.2 从 `package.json.ejs` 的 `devDependencies` 中移除 `babel-plugin-lodash`
- [ ] 5.3 从 `package.json.ejs` 的 `devDependencies` 中移除 `glob`
- [ ] 5.4 从 `webpack.base.js.ejs` 的 babel JSX loader 配置中移除 `plugins: ['lodash']`
- [ ] 5.5 从 `webpack.base.js.ejs` 的 babel TS loader 配置中移除 `plugins: ['lodash']`
- [ ] 5.6 改造 `webpack.standalone.js`，将 `glob` 替换为 `fs.readdirSync` + 递归查找

## 6. 验证

- [ ] 6.1 运行 `npm run build` 确认 CLI 编译无类型错误
- [ ] 6.2 本地执行 CLI 测试各交互场景
