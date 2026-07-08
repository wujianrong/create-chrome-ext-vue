## 1. 复制 Core 源码到模板目录

- [x] 1.1 在 `templates/src/core/` 下创建与 `packages/core/src/` 一致的目录结构（base/、channel/）
- [x] 1.2 复制 `packages/core/src/` 下所有源文件到 `templates/src/core/`（排除 `global.d.ts`，因模板已有）
- [x] 1.3 验证复制后的文件结构完整（index.ts、interface.ts、module-registry.ts、cross-world-bridge.ts、base/*.ts、channel/*.ts 均存在）

## 2. 替换 Import 路径

- [x] 2.1 替换模板中所有 `.ts` 文件的 import：`@chrome-ext-vue/core` → `@/core`（background/index.ts、content-scripts/cs-isolated.ts、content-scripts/cs-main.ts、popup/main.ts、popup/composables/useTheme.ts、popup/utils/module-action.ts、tab-app/composables/useTheme.ts）
- [x] 2.2 替换模板中所有 `.vue` 文件的 import：`@chrome-ext-vue/core` → `@/core`（popup/views/HomePage.vue、popup/views/ModulePage.vue、popup/components/CardGrid.vue、popup/components/ModuleCard.vue、popup/components/TreeMenu.vue、popup/views/demo/index.vue、tab-app/views/ModulePage.vue、sidepanel/App.vue）
- [x] 2.3 替换模板中 `.ejs` 文件的 import 路径（src/modules/index.ts.ejs）
- [x] 2.4 替换 demo 模块目录下的所有 import（modules/demo/*.ts、modules/demo/*.vue、modules/demo-tab/*、modules/demo-sidepanel/*、modules/demo-devtools/*）

## 3. 更新 Webpack 构建配置

- [x] 3.1 在 `build/webpack.base.js.ejs` 中移除 `@chrome-ext-vue/core` 的 alias 配置行

## 4. 移除 npm 依赖

- [x] 4.1 在 `templates/package.json.ejs` 中移除 `@chrome-ext-vue/core` 依赖行

## 5. 创建文档文件

- [x] 5.1 在 `templates/docs/` 目录下创建 `CORE_API.md`，按三层分类列出所有导出 API、用途说明和示例代码
- [x] 5.2 在 `templates/docs/` 目录下创建 `ARCHITECTURE.md`，包含 ASCII 架构图和通信流程说明

## 6. 验证

- [x] 6.1 执行 `npm create chrome-ext-vue` 生成测试项目，确认 `src/core/` 目录完整、import 路径正确、webpack 配置无旧 alias
- [x] 6.2 在测试项目中执行 `npm install && npm run build`，确认构建成功无报错
- [x] 6.3 确认 `docs/CORE_API.md` 和 `docs/ARCHITECTURE.md` 正确生成
- [x] 6.4 确认 `package.json` 中不包含 `@chrome-ext-vue/core` 依赖
