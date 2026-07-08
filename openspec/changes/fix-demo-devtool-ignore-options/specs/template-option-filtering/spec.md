## ADDED Requirements

### Requirement: 禁用 Demo 时不生成 Demo 源码

当用户选择 `hasDemo = false` 时，系统 SHALL 不将以下目录复制到目标项目：
- `src/modules/demo/`
- `src/modules/demo-devtools/`
- `src/modules/demo-sidepanel/`
- `src/modules/demo-tab/`

#### Scenario: hasDemo 为 false 时不生成 demo 模块目录

- **WHEN** 用户在交互式问答中选择"不包含 Demo 示例模块"
- **THEN** 目标项目中不存在 `src/modules/demo/`、`src/modules/demo-devtools/`、`src/modules/demo-sidepanel/`、`src/modules/demo-tab/` 目录
- **AND** 其他模板文件正常生成

#### Scenario: hasDemo 为 true 时正常生成所有 demo 模块目录

- **WHEN** 用户在交互式问答中选择"包含 Demo 示例模块"
- **THEN** 目标项目中存在 `src/modules/demo/` 目录
- **AND** `modules/index.ts` 中包含对应的 demo 模块导入

### Requirement: hasDemo 为 true 时子选项联动过滤 Demo 子目录

当 `hasDemo = true` 时，系统 SHALL 根据子选项控制对应 Demo 子目录的生成：

| 选项 | 控制目录 |
|------|---------|
| `hasDevTools = false` | 不生成 `src/modules/demo-devtools/` |
| `hasSidePanel = false` | 不生成 `src/modules/demo-sidepanel/` |
| `hasTab = false` | 不生成 `src/modules/demo-tab/` |

#### Scenario: hasDemo 为 true 但 hasDevTools 为 false 时跳过 devtools 目录

- **WHEN** `hasDemo = true` 且 `hasDevTools = false`
- **THEN** 目标项目中不存在 `src/modules/demo-devtools/` 目录
- **AND** 目标项目中存在 `src/modules/demo/`、`src/modules/demo-sidepanel/`、`src/modules/demo-tab/` 目录

#### Scenario: hasDemo 为 true 且所有子选项为 true 时全部生成

- **WHEN** `hasDemo = true`、`hasDevTools = true`、`hasSidePanel = true`、`hasTab = true`
- **THEN** 所有 demo 子目录均正常生成

### Requirement: 不生成孤儿 demo 视图文件

系统 SHALL 不将 `src/popup/views/demo/` 目录复制到目标项目，因为该目录未被任何模板代码引用。

#### Scenario: 目标项目中不存在孤儿 demo 视图文件

- **WHEN** 使用任意选项组合生成项目
- **THEN** 目标项目中不存在 `src/popup/views/demo/` 目录
