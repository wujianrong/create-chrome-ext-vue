# create-chrome-ext-vue-template

`create-chrome-ext-vue` CLI 脚手架的项目模板，包含完整的 Chrome 扩展开发框架。

## 说明

这是 `create-chrome-ext-vue` CLI 的内部依赖包，**无需手动安装**。执行以下命令时会自动使用此模板生成项目：

```bash
npx create-chrome-ext-vue my-chrome-ext
```

## 模板内容

生成的项目包含以下框架能力：

| 能力 | 说明 |
|------|------|
| **Channel 通信** | 跨组件统一通信，Popup ↔ Background ↔ Content Script 自动路由，支持发送、请求-响应、广播三种模式 |
| **ModuleRegistry** | 模块注册中心，注册即自动出现在首页、生成路由、注册 handler |
| **CrossWorldBridge** | Content Script ISOLATED ↔ MAIN world 双向通信，三层安全校验 |
| **Base 门面类** | `extends Base` 继承 storage / http / tabs / messaging 能力 |
| **Popup UI** | Vue 3 + Element Plus + Router，暗色/浅色主题切换，模块卡片 |

## 技术栈

- **Vue 3** — UI 框架
- **TypeScript** — 类型安全
- **Webpack 5** — 构建工具
- **Element Plus** — 组件库
- **Manifest V3** — Chrome 扩展标准

## 项目结构

```
├── src/
│   ├── background/        ← Service Worker 入口
│   ├── content-scripts/   ← 注入脚本（ISOLATED + MAIN world）
│   ├── popup/             ← Popup UI 应用
│   ├── sidepanel/         ← Side Panel 应用（可选）
│   ├── tab-app/           ← Tab 独立页面应用（可选）
│   ├── core/              ← 框架核心模块
│   │   ├── base/          ← Base 门面 + channel / storage / http / tabs
│   │   ├── module-registry.ts
│   │   └── cross-world-bridge.ts
│   └── modules/           ← 业务模块目录
│       └── demo/          ← Demo 示例模块
├── build/                 ← Webpack 构建配置
└── manifest.json          ← Chrome 扩展配置（EJS 模板动态生成）
```

## License

MIT
