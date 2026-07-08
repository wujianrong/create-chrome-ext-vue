## 1. 实现 copyDir 条件过滤逻辑

- [x] 1.1 在 `copyDir()` 函数中新增基于 `TemplateOptions` 的排除目录计算逻辑：`hasDemo` 为 `false` 时排除 `demo`、`demo-devtools`、`demo-sidepanel`、`demo-tab`；`hasDemo` 为 `true` 时根据各子选项排除对应目录
- [x] 1.2 在目录遍历的递归分支中加入排除判断：当 `srcPath` 相对路径匹配排除目录时跳过

## 2. 清理孤儿文件

- [x] 2.1 删除 `templates/src/popup/views/demo/` 目录及其中的 `index.vue`

## 3. 编译验证

- [x] 3.1 执行 `npm run build` 编译 CLI 包（`packages/create-chrome-ext-vue`）
- [x] 3.2 使用不同选项组合生成项目（无 Demo、有 Demo 无 DevTools、有 Demo 全选），验证目标目录内容正确

## 4. 自检

- [x] 4.1 运行 `npm run lint` 检查代码风格（项目无 ESLint 配置，已手动检查符合规范）
- [x] 4.2 确认 `.ejs` 文件条件渲染逻辑无需修改（已有正确处理）
