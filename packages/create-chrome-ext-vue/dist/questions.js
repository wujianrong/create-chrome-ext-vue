"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestions = askQuestions;
const prompts_1 = require("@clack/prompts");
async function askQuestions(targetDir) {
    (0, prompts_1.intro)('create-chrome-ext-vue — Chrome Extension 开发脚手架');
    const projectName = await (0, prompts_1.text)({
        message: '项目名称',
        placeholder: 'my-chrome-ext',
        defaultValue: targetDir.split(/[/\\]/).pop() || 'my-chrome-ext',
        validate(value) {
            if (!value.trim())
                return '项目名不能为空';
            if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value))
                return '项目名只能包含小写字母、数字和连字符';
        }
    });
    if ((0, prompts_1.isCancel)(projectName)) {
        (0, prompts_1.outro)('已取消');
        return null;
    }
    const description = await (0, prompts_1.text)({
        message: '项目描述',
        placeholder: 'Chrome Extension powered by Vue 3',
        defaultValue: 'Chrome Extension powered by Vue 3'
    });
    if ((0, prompts_1.isCancel)(description)) {
        (0, prompts_1.outro)('已取消');
        return null;
    }
    const entryResult = await (0, prompts_1.group)({
        contentScript: () => (0, prompts_1.confirm)({
            message: '启用 Content Script 注入？（含 ISOLATED + MAIN world 双通道）',
            initialValue: true
        }),
        sidePanel: () => (0, prompts_1.confirm)({
            message: '启用 Side Panel 侧边栏？',
            initialValue: false
        }),
        devTools: () => (0, prompts_1.confirm)({
            message: '启用 DevTools 面板？',
            initialValue: false
        }),
        tab: () => (0, prompts_1.confirm)({
            message: '启用 Tab 独立页面？',
            initialValue: false
        }),
        webview: () => (0, prompts_1.confirm)({
            message: '启用 Webview 独立页面？',
            initialValue: false
        })
    }, {
        onCancel() {
            (0, prompts_1.outro)('已取消');
        }
    });
    if (!entryResult) {
        (0, prompts_1.outro)('已取消');
        return null;
    }
    const hasDemo = await (0, prompts_1.confirm)({
        message: '是否包含 Demo 示例模块？（展示 Channel + CrossWorldBridge 用法）',
        initialValue: true
    });
    if ((0, prompts_1.isCancel)(hasDemo)) {
        (0, prompts_1.outro)('已取消');
        return null;
    }
    const pkgChoice = await (0, prompts_1.multiselect)({
        message: '包管理器',
        options: [
            { value: 'npm', label: 'npm', hint: '推荐' },
            { value: 'yarn', label: 'yarn' },
            { value: 'pnpm', label: 'pnpm' },
            { value: 'skip', label: '跳过安装', hint: '我自己装' }
        ],
        required: true
    });
    if ((0, prompts_1.isCancel)(pkgChoice) || !pkgChoice) {
        (0, prompts_1.outro)('已取消');
        return null;
    }
    const pkgManager = (Array.isArray(pkgChoice) ? pkgChoice[0] : pkgChoice);
    return {
        name: projectName.trim(),
        description: description.trim(),
        hasSidePanel: entryResult.sidePanel,
        hasDevTools: entryResult.devTools,
        hasTab: entryResult.tab,
        hasWebview: entryResult.webview,
        hasContentScript: entryResult.contentScript,
        hasDemo: hasDemo,
        packageManager: pkgManager,
        targetDir
    };
}
//# sourceMappingURL=questions.js.map