# AGENTS.md – OpenSpec 全局约定

本文件为 OpenSpec 开发流程中的 AI 提供全局编码规范、架构约定和技术约束。每次创建 artifact 或执行 change 时均应遵循。

---

## 沟通语言

- 日常沟通必须使用中文，直奔主题，优先说明结论、改动和验证结果。
- 技术报错、异常名、API 名称、命令输出、库名、配置键、HTTP 状态码等保留英文原文。
- 如果出现错误，不要只翻译或概括；必须保留关键英文错误信息，方便用户复制到搜索引擎查询。
- 解释技术方案时可以中文为主，英文术语保留原名，例如 `ECharts`、`localStorage`、`setInterval`、`DOMContentLoaded`。
- 用户英文基础较弱，避免要求用户用英文补充需求；需要确认时用中文问一个关键问题即可。


## 工作规则

- 禁止自主决策开发行为，严格遵循 OpenSpec 流程执行开发任务
- 使用 OpenSpec 规范定义需求与变更⼯件
- 没有 OpenSpec change，不允许直接开始开发
- 不允许超出 `tasks.md` ⾃⾏扩需求
- 每完成⼀个⾥程碑，都必须运⾏相关检查
- 业务逻辑代码与视图展示代码分离（Business Logic 与 UI 解耦，便于单元测试和复用）
- 开发环境为 Windows 系统，所有脚本命令需兼容 Windows 环境

---

### TypeScript

- 代码风格遵循 `.eslintrc.js` （继承 `standard` 规范）和`.prettierrc.js`，所有风格类规则由 ESLint 控制，不做额外手写约定
- 模块：**ES Module**，仅使用命名导入/导出
- 异步：优先使用 **async/await**
- 注释：使用**中文** JSDoc 和行内注释


## OpenSpec 开发流程

### 创建 Change

使用 OpenSpec skill 相关命令创建新 change：

- 功能开发、Bug 修复、重构均通过 OpenSpec change 管理
- 每个 change 应包含：proposal（提案）、design（设计）、specs（规格）、tasks（任务）
