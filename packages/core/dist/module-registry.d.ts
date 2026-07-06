import type { Component } from 'vue';
export type ModuleActionType = 'popup' | 'tab' | 'devtools' | 'sidepanel';
export interface IModule {
    name: string;
    label: string;
    route?: {
        path: string;
        component: Component | (() => Promise<Component>);
    };
    actionType?: ModuleActionType;
    targetUrl?: string;
    icon?: string;
    description?: string;
    category?: string;
    enabled: boolean;
    registerContentHandlers?: () => void;
    registerMainWorldHandlers?: () => void;
}
export interface ModuleMeta {
    name: string;
    label: string;
    icon: string;
    description: string;
    category: string;
    actionType: ModuleActionType;
    targetUrl?: string;
}
declare class ModuleRegistry {
    private modules;
    register(module: IModule): void;
    getRoutes(): Array<{
        path: string;
        name: string;
        component: Component;
    }>;
    initContentHandlers(): void;
    initMainWorldHandlers(): void;
    getModules(): ModuleMeta[];
    getModule(name: string): IModule | undefined;
}
export declare const moduleRegistry: ModuleRegistry;
export {};
//# sourceMappingURL=module-registry.d.ts.map