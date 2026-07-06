export interface ScaffoldOptions {
    name: string;
    description: string;
    hasSidePanel: boolean;
    hasDevTools: boolean;
    hasTab: boolean;
    hasWebview: boolean;
    hasContentScript: boolean;
    hasDemo: boolean;
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'skip';
    targetDir: string;
}
export declare function askQuestions(targetDir: string): Promise<ScaffoldOptions | null>;
