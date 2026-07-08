# core-api-documentation

## Purpose

在生成的项目模板中提供 Core API 的索引文档和架构说明文档，帮助用户快速了解所有可用的基础设施能力和系统架构。

## Requirements

### Requirement: API 索引文档生成

生成的项目 MUST 在 `docs/CORE_API.md` 文件中列出所有 core 公开导出的 API，帮助用户快速了解可用的基础设施能力。

#### Scenario: 文档文件存在

- **WHEN** 用户执行 `npm create chrome-ext-vue` 完成项目生成
- **THEN** `docs/CORE_API.md` 文件存在
- **AND** 文件为纯 Markdown 格式，非 EJS 模板

#### Scenario: 按功能分类列出 API

- **WHEN** 用户阅读 `docs/CORE_API.md`
- **THEN** 文件按以下分类组织 API 列表：
  - 基础设施层（storage、popup、tabs、messaging、http、proxyHttp、Base）
  - 通信层（Channel、channelBg、channelPopup、channelContent、channelOptions、channelDevTools、CrossWorldBridge）
  - 模块层（ModuleRegistry、IModule、ModuleMeta、ModuleActionType）
  - 类型定义（ChannelType、MessageType）

#### Scenario: 每个 API 包含说明和示例

- **WHEN** 用户查看某个 API 条目
- **THEN** 条目包含 API 名称、简短说明（1-2 句中文描述）、和最小化使用示例代码

### Requirement: 架构文档生成

生成的项目 MUST 在 `docs/ARCHITECTURE.md` 文件中说明 core 各组件的架构关系和通信流程。

#### Scenario: 架构文档存在

- **WHEN** 用户执行 `npm create chrome-ext-vue` 完成项目生成
- **THEN** `docs/ARCHITECTURE.md` 文件存在
- **AND** 文件为纯 Markdown 格式，非 EJS 模板

#### Scenario: 包含 ASCII 架构图

- **WHEN** 用户阅读 `docs/ARCHITECTURE.md`
- **THEN** 文件包含 ASCII 图示，展示 Background、Popup、Content Script、Bridge 之间的通信关系
- **AND** 图中标注各组件使用的 core API

#### Scenario: 包含通信流程说明

- **WHEN** 用户阅读 `docs/ARCHITECTURE.md`
- **THEN** 文件说明典型通信流程（如 Popup 通过 Channel 向 Content Script 发消息、Content Script 通过 Bridge 与 MAIN world 通信）
- **AND** 说明包含步骤编号和每步使用的 API
