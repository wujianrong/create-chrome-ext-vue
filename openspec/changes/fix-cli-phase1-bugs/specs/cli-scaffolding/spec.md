## ADDED Requirements

### Requirement: EJS 模板渲染必须等待完成后再继续流程

CLI 在复制模板文件时，对 `.ejs` 文件调用 `ejs.renderFile` 进行渲染。渲染是异步操作，系统 SHALL 等待所有 EJS 模板渲染完成并写入磁盘后，才继续执行后续步骤（如 `npm install`）。

#### Scenario: 模板渲染完成后再安装依赖

- **WHEN** CLI 执行 `copyDir` 复制模板目录，且目标目录中存在 `.ejs` 文件
- **THEN** 系统在所有 `.ejs` 文件渲染并写入磁盘之前，SHALL NOT 继续执行 `npm install` 或其他后续步骤

#### Scenario: 渲染失败时中止流程

- **WHEN** 任一 `.ejs` 模板渲染过程中抛出异常
- **THEN** 系统 SHALL 中止文件生成流程并输出错误信息

### Requirement: 包管理器选择必须使用单选交互

用户选择包管理器时，系统 SHALL 使用单选交互组件（`select`），而非多选组件（`multiselect`）。每个项目只能使用一种包管理器安装依赖。

#### Scenario: 用户选择 npm 作为包管理器

- **WHEN** 用户在包管理器选择步骤中选择 `npm`
- **THEN** 系统 SHALL 使用 `npm install` 安装依赖

#### Scenario: 用户选择跳过安装

- **WHEN** 用户选择 `skip`
- **THEN** 系统 SHALL 跳过依赖安装步骤，直接输出项目创建完成信息

### Requirement: 未启用的应用目录必须在生成时被排除

CLI 根据用户交互选项（hasSidePanel、hasTab 等）决定是否启用对应的应用目录。对于未启用的目录，系统 SHALL 在 `copyDir` 阶段跳过复制，确保生成的项目中不包含无用的代码文件。

#### Scenario: 跳过 sidepanel 目录

- **WHEN** 用户未启用 Side Panel 功能
- **THEN** 系统 SHALL NOT 将 `src/sidepanel/` 目录复制到目标项目

#### Scenario: 跳过 tab-app 目录

- **WHEN** 用户未启用 Tab 独立页面功能
- **THEN** 系统 SHALL NOT 将 `src/tab-app/` 目录复制到目标项目

#### Scenario: 保留 modules 目录中非 demo 的模块目录

- **WHEN** `hasDemo` 为 false 但用户启用了 SidePanel/Tab/DevTools 功能
- **THEN** 系统 SHALL 仍然排除 `src/modules/demo-*` 目录，但不排除 `src/modules/` 目录本身

### Requirement: manifest.json 中空的 web_accessible_resources 不得输出

当用户未启用 Tab 和 Side Panel 时，`manifest.json.ejs` 模板生成的 `web_accessible_resources` 中 `resources` 数组为空。系统 SHALL 在此情况下不输出 `web_accessible_resources` 字段。

#### Scenario: 无 Tab 和 SidePanel 时不输出 web_accessible_resources

- **WHEN** `hasTab` 和 `hasSidePanel` 均为 false
- **THEN** 生成的 `manifest.json` SHALL NOT 包含 `web_accessible_resources` 字段

#### Scenario: 仅启用 Tab 时输出 tab-app 资源

- **WHEN** `hasTab` 为 true，`hasSidePanel` 为 false
- **THEN** 生成的 `manifest.json` 中 `web_accessible_resources.resources` SHALL 仅包含 `"tab-app/*"`

### Requirement: 模板包依赖不得包含冗余或未使用的包

模板包 `package.json.ejs` 生成的 `package.json` 中，SHALL NOT 包含以下不被项目实际使用的依赖：
- `scss-loader`: 功能已被 `sass-loader` 覆盖
- `babel-plugin-lodash`: 项目未依赖 `lodash`
- `glob`: 仅在 `webpack.standalone.js` 中使用，而该配置文件不在条件排除范围内

#### Scenario: 模板包中没有冗余依赖

- **WHEN** CLI 使用模板包生成项目的 `package.json`
- **THEN** `dependencies` 和 `devDependencies` SHALL NOT 包含 `scss-loader`、`babel-plugin-lodash`、`glob`
