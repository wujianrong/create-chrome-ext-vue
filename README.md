# create-chrome-ext-vue

Chrome Extension 开发脚手架，基于 **Vue 3 + TypeScript + Webpack 5**，内置框架级通信架构。

一行命令，生成标准化的 Chrome 插件项目模板。

## 快速开始

```bash
npx create-chrome-ext-vue my-chrome-ext
cd my-chrome-ext
npm run dev
```

构建产物在 `dist/` 目录，在 Chrome `chrome://extensions` 中加载 "已解压的扩展程序" 即可。

## CLI 选项说明

执行 `npx create-chrome-ext-vue` 后，会依次提问以下选项：

### 1. 项目名称

默认值：当前目录名。只能包含小写字母、数字和连字符（kebab-case）。

```
? 项目名称：my-chrome-ext
```

### 2. 项目描述

默认值：`Chrome Extension powered by Vue 3`。将写入 `package.json` 和 `manifest.json`。

```
? 项目描述：Chrome Extension powered by Vue 3
```

### 3. 启用入口页面（多选）

| 选项 | 默认 | 说明 |
|------|------|------|
| **Content Script 注入** | 选中 | 启用后可在目标网页中注入脚本。包含 ISOLATED world（有 Chrome API 权限）和 MAIN world（可操作页面 DOM）双通道，通过 CrossWorldBridge 双向通信 |
| **Side Panel 侧边栏** | 不选 | Chrome 侧边栏面板，在 `manifest.json` 中声明 `side_panel` 权限和路径 |
| **DevTools 面板** | 不选 | Chrome DevTools 面板扩展 |
| **Tab 独立页面** | 不选 | 通过 `chrome.tabs.create` 打开的新标签页，可在插件外独立运行完整 Web 应用 |
| **Webview 独立页面** | 不选 | 通过 `window.open` 打开的独立窗口页面 |

> **Popup 弹窗页始终启用**，无需选择。它是插件的主入口 UI。

### 4. Demo 示例模块

默认值：是。

```
? 是否包含 Demo 示例模块？（展示 Channel + CrossWorldBridge 用法）Y/n
```

选择 "是" 后，生成的项目会包含 `src/modules/demo/` 目录，包含一个 "页面标题提取器" 示例，完整演示：

```
Popup (按钮点击) → Channel (Popup→Background→Content Script)
                 → CrossWorldBridge (ISOLATED→MAIN world)
                 → MAIN world 读取 document.title → 逐级返回
```

选择 "否" 则生成空的 `modules/` 目录，可以按模板自行开发模块。

### 5. 包管理器

```
? 包管理器
  ○ npm    ← 推荐
  ○ yarn
  ○ pnpm
  ○ 跳过安装（我自己装）
```

选择后自动执行 `install` 安装依赖。选 "跳过" 则需要手动安装。

## 生成的项目结构

```
my-chrome-ext/
├── manifest.json              ← Chrome 扩展配置（按选项动态生成）
├── package.json               ← 项目依赖配置
├── tsconfig.json              ← TypeScript 配置
├── .eslintrc.js / .prettierrc ← 代码规范
├── build/
│   └── webpack.base.js        ← Webpack 构建配置（按选项动态生成入口）
└── src/
    ├── background/            ← Service Worker 入口
    ├── content-scripts/       ← 注入脚本（ISOLATED + MAIN world）
    ├── popup/                 ← Popup UI（Vue 3 + Element Plus + Router）
    │   ├── components/        ← 通用组件（CardGrid / TreeMenu / UpdateBanner）
    │   ├── views/             ← 框架页面（HomePage / ModulePage）
    │   └── composables/       ← 组合式函数（useTheme / useVersionCheck）
    ├── sidepanel/             ← 侧边栏 UI（可选）
    ├── webview/               ← Webview 页面（可选）
    ├── tab-app/               ← Tab 页面（可选）
    ├── modules/               ← 业务模块目录
    │   └── demo/              ← Demo 示例（可选）
    └── types/                 ← 通用类型定义
```

## 新增模块

在生成的项目中，新增一个功能模块只需要 3 步：

**1. 创建模块目录和文件**

```
src/modules/my-feature/
├── index.ts      ← IModule 定义（元数据 + 路由 + handler 注册）
└── popup.vue     ← Popup UI 组件
```

**2. 编写模块定义**

```typescript
// src/modules/my-feature/index.ts
import type { IModule } from '@chrome-ext-vue/core'

const myModule: IModule = {
  name: 'my-feature',
  label: '我的功能',
  icon: 'Star',
  description: '功能描述',
  category: '工具',
  enabled: true,
  actionType: 'popup',
  route: {
    path: '/my-feature',
    component: () => import('./popup.vue')
  }
}

export default myModule
```

**3. 注册模块**

在 `src/modules/index.ts` 中添加：

```typescript
import myModule from './my-module'
moduleRegistry.register(myModule)
```

重新构建后，模块卡片自动出现在 Popup 首页。

## 框架能力

生成的项目依赖 `@chrome-ext-vue/core`，提供以下框架能力：

| 能力 | 说明 |
|------|------|
| **Channel 通信** | 跨组件统一通信，Popup↔Background↔Content 自动路由，支持单向发送、请求-响应、广播三种模式 |
| **Base 门面类** | 一行 `extends Base` 继承所有能力：`g_storage`、`g_http`、`g_tabs`、`g_messaging` |
| **ModuleRegistry** | 模块注册中心，注册即自动出现在首页、自动生成路由、自动注册 handler |
| **CrossWorldBridge** | ISOLATED↔MAIN world 双向通信，三层安全校验（source + secret + type） |
| **版本检测** | 内置远程版本检测 + 强制升级 + 更新提示组件 |

详见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 本地开发（脚手架本身）

```bash
# 安装依赖
npm install

# 编译 CLI 包
cd packages/create-chrome-ext-vue && npm run build

# 本地测试
node bin/create-chrome-ext-vue.js test-project
```

## License

MIT
