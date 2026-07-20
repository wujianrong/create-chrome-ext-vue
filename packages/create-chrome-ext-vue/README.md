# create-chrome-ext-vue

Chrome 扩展开发脚手架，基于 **Vue 3 + TypeScript + Webpack 5**，内置框架级通信架构。

一行命令，生成标准化的 Chrome 插件项目模板。

## 使用

```bash
# npm
npx create-chrome-ext-vue@latest my-chrome-ext

# 或全局安装后使用
npm install -g create-chrome-ext-vue
create-chrome-ext-vue my-chrome-ext
```

```bash
cd my-chrome-ext
npm run dev
```

构建产物在 `dist/` 目录，在 Chrome `chrome://extensions` 中加载「已解压的扩展程序」即可开始开发。

## CLI 交互选项

执行后按提示依次选择：

| 选项 | 说明 |
|------|------|
| **项目名称** | 只能包含小写字母、数字和连字符（kebab-case） |
| **项目描述** | 写入 `package.json` 和 `manifest.json` |
| **Content Script 注入** | 默认启用，包含 ISOLATED + MAIN world 双通道 |
| **Side Panel 侧边栏** | 可选 |
| **DevTools 面板** | 可选 |
| **Tab 独立页面** | 可选 |
| **Demo 示例模块** | 默认包含，展示 Channel + CrossWorldBridge 通信用法 |
| **包管理器** | npm / yarn / pnpm / 跳过 |

## 生成的项目

```
my-chrome-ext/
├── manifest.json          ← Chrome 扩展配置（按选项动态生成）
├── package.json
├── tsconfig.json
├── build/
│   └── webpack.base.js    ← Webpack 构建配置
└── src/
    ├── background/        ← Service Worker
    ├── content-scripts/   ← 注入脚本（ISOLATED + MAIN world）
    ├── popup/             ← Popup UI（Vue 3 + Element Plus）
    ├── modules/           ← 业务模块目录
    └── core/              ← 框架核心（Channel / ModuleRegistry / CrossWorldBridge）
```

## 新增模块

在生成的项目中，新增功能只需 3 步：

```typescript
// 1. 创建 src/modules/my-feature/index.ts
import type { IModule } from '@/core'

export default {
  name: 'my-feature',
  label: '我的功能',
  icon: 'Star',
  actionType: 'popup',
  route: {
    path: '/my-feature',
    component: () => import('./popup.vue')
  }
} as IModule

// 2. 在 src/modules/index.ts 中注册
import myModule from './my-feature'
moduleRegistry.register(myModule)

// 3. 重新构建，模块卡片自动出现在 Popup 首页
```

## 命令行参数

```bash
create-chrome-ext-vue [project-name] [options]

Options:
  --template <path>  指定自定义模板路径（本地目录）
```

## License

MIT
