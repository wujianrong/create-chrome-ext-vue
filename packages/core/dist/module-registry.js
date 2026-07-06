class ModuleRegistry {
    constructor() {
        this.modules = new Map();
    }
    register(module) {
        if (this.modules.has(module.name)) {
            console.warn(`[ModuleRegistry] 模块 "${module.name}" 已注册，忽略重复注册`);
            return;
        }
        this.modules.set(module.name, module);
    }
    getRoutes() {
        return Array.from(this.modules.values())
            .filter(m => !m.actionType && m.route)
            .map(m => ({
            path: `/module/${m.name}`,
            name: `module-${m.name}`,
            component: m.route.component
        }));
    }
    initContentHandlers() {
        this.modules.forEach(module => {
            module.registerContentHandlers?.();
        });
    }
    initMainWorldHandlers() {
        this.modules.forEach(module => {
            module.registerMainWorldHandlers?.();
        });
    }
    getModules() {
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
        }));
    }
    getModule(name) {
        return this.modules.get(name);
    }
}
export const moduleRegistry = new ModuleRegistry();
//# sourceMappingURL=module-registry.js.map