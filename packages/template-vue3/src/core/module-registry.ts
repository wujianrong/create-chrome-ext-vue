import type { Component } from 'vue'

/** 模块入口方式类型 */
export type ModuleActionType = 'popup' | 'tab' | 'devtools' | 'sidepanel'

/** 模块接口定义 */
export interface IModule {
  /** 模块唯一标识 */
  name: string
  /** 显示名称 */
  label: string
  /** Vue Router 路由配置（仅 actionType: 'popup' 时需要） */
  route?: {
    path: string
    /** 组件支持静态导入或动态 lazy import */
    component: Component | (() => Promise<Component>)
  }
  /** 入口方式，默认 'popup' */
  actionType?: ModuleActionType
  /** 外部类型模块的目标 URL（tab/devtools/sidepanel 时需要） */
  targetUrl?: string
  /** 卡片图标名称（Element Plus icon，默认 Menu） */
  icon?: string
  /** 卡片描述文字 */
  description?: string
  /** 分组类别（默认 '未分类'） */
  category?: string
  /** 是否启用（默认 true），设为 false 则模块不在首页展示 */
  enabled: boolean
  /** 可选：在 Content Script (ISOLATED world) 中注册 Channel 消息处理 */
  registerContentHandlers?: () => void
  /** 可选：在 Content Script (MAIN world) 中注册 bridge 消息处理 */
  registerMainWorldHandlers?: () => void
}

/** 模块元数据（供 Popup 卡片网格和树形菜单使用） */
export interface ModuleMeta {
  name: string
  label: string
  icon: string
  description: string
  category: string
  actionType: ModuleActionType
  targetUrl?: string
}
class ModuleRegistry {
  private modules = new Map<string, IModule>()

  /** 注册一个模块，重复注册会打印警告并忽略 */
  register(module: IModule): void {
    if (this.modules.has(module.name)) {
      console.warn(`[ModuleRegistry] 模块 "${module.name}" 已注册，忽略重复注册`)
      return
    }
    this.modules.set(module.name, module)
  }

  /** 获取所有模块的路由配置（仅 popup 类型） */
  getRoutes(): Array<{ path: string; name: string; component: Component }> {
    return Array.from(this.modules.values())
      .filter(m => !m.actionType && m.route)
      .map(m => ({
        path: `/module/${m.name}`,
        name: `module-${m.name}`,
        component: m.route!.component
      }))
  }

  /** 初始化所有模块的 ISOLATED world 消息处理器 */
  initContentHandlers(): void {
    this.modules.forEach(module => {
      module.registerContentHandlers?.()
    })
  }

  /** 初始化所有模块的 MAIN world 消息处理器 */
  initMainWorldHandlers(): void {
    this.modules.forEach(module => {
      module.registerMainWorldHandlers?.()
    })
  }

  /** 获取模块元数据列表（供 Popup 卡片网格和树形菜单使用） */
  getModules(): ModuleMeta[] {
    return Array.from(this.modules.values())
      .filter(m => m.enabled !== false)
      .map(m => ({
        name: m.name,
        label: m.label,
        icon: m.icon || 'Menu',
        description: m.description || '',
        category: m.category || '未分类',
        actionType: m.actionType || 'popup',
        targetUrl: m.targetUrl
      }))
  }

  /** 按名称获取原始 IModule */
  getModule(name: string): IModule | undefined {
    return this.modules.get(name)
  }
}

export const moduleRegistry = new ModuleRegistry()
