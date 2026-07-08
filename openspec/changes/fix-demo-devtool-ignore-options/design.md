## Context

当前 `copyDir()` 函数递归遍历 `templates/` 目录，仅对 `.ejs` 文件进行条件渲染（通过 `TemplateOptions` 控制输出内容），非 `.ejs` 文件**无条件复制**。Demo 模块的源码文件（`.ts`、`.vue`）均为非 `.ejs` 文件，因此即使用户选择了 `hasDemo: false` 或 `hasDevTools: false`，这些文件仍会被复制到目标项目。

受影响目录（相对于 `templates/`）：

| 目录 | 依赖选项 | 备注 |
|------|---------|------|
| `src/modules/demo/` | `hasDemo` | Demo 示例模块 |
| `src/modules/demo-devtools/` | `hasDemo && hasDevTools` | DevTools 面板示例 |
| `src/modules/demo-sidepanel/` | `hasDemo && hasSidePanel` | SidePanel 示例 |
| `src/modules/demo-tab/` | `hasDemo && hasTab` | Tab 页面示例 |
| `src/popup/views/demo/` | `hasDemo` | 孤儿文件，无任何模板引用 |

## Goals / Non-Goals

**Goals:**
- 修复 `copyDir()` 使其根据 `TemplateOptions` 跳过不应生成的 Demo 子目录
- 移除 `src/popup/views/demo/` 孤儿目录
- 保持 `copyDir()` 现有逻辑结构，最小侵入修改

**Non-Goals:**
- 不在 `manifest.json.ejs` 中新增 `devtools_page` 配置（属独立功能需求）
- 不修改非 Demo 相关目录的复制逻辑
- 不修改 `questions.ts` 的交互式问答逻辑

## Decisions

### 方案一：在 `copyDir` 中内联排除列表

在 `copyDir()` 函数开头，根据 `options` 计算需要跳过的目录名（相对于 `src/` 的路径片段），当递归到匹配的目录时直接跳过。

**优点**：逻辑集中在一处，无需外部依赖
**缺点**：目录路径匹配逻辑可能随着模板结构调整而需要同步维护

### 方案二：将 Demo 源码全部改为 `.ejs` 文件（每个文件加 `<% if %>` 包裹）

**优点**：复用现有 EJS 渲染机制
**缺点**：工作量大（需改造 10+ 个文件），Vue SFC 文件不适合嵌入 EJS 语法，`.ts` 文件也会增加复杂度

**结论：选择方案一。** 方案一改动最小、风险最低，且模板目录结构稳定，路径匹配的维护成本可忽略。

### 实施方案细节

在 `copyDir()` 中，当遇到子目录时，比较路径判断是否属于需要排除的目录列表：

```typescript
const excludeDirs: string[] = []
if (!options.hasDemo) {
  excludeDirs.push('demo', 'demo-devtools', 'demo-sidepanel', 'demo-tab')
} else {
  if (!options.hasDevTools) excludeDirs.push('demo-devtools')
  if (!options.hasSidePanel) excludeDirs.push('demo-sidepanel')
  if (!options.hasTab) excludeDirs.push('demo-tab')
}
```

目录匹配策略：检查源目录路径中是否包含对应的排除目录名（基于 `templates/` 的相对路径前缀）。具体实现时，可通过比较 `srcPath` 相对于 `TEMPLATE_DIR` 的路径来判断。

### 孤儿文件处理

`templates/src/popup/views/demo/` 目录：
- **确认未被任何模板代码引用**（包括 `.ejs` 文件中的条件渲染）
- 直接删除该目录即可，无需在 `copyDir()` 中增加额外过滤逻辑

## Risks / Trade-offs

- **目录名硬编码**：排除列表中的目录名与模板目录结构耦合。若未来新增 Demo 子目录（如 `demo-new-feature/`），需同步更新排除逻辑。
  - **缓解**：Demo 模块目录结构稳定，新增概率低。可在 `copyDir` 中增加注释说明维护规则。
- **路径匹配边界**：当目录名过于通用时可能误排除非 Demo 目录。
  - **缓解**：使用完整路径前缀匹配，而非只匹配目录名。
