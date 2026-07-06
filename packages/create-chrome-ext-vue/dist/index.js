"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const commander_1 = require("commander");
const path_1 = require("path");
const fs_1 = require("fs");
const ejs_1 = require("ejs");
const child_process_1 = require("child_process");
const prompts_1 = require("@clack/prompts");
const questions_1 = require("./questions");
const TEMPLATE_DIR = (0, path_1.join)(__dirname, '..', 'templates');
function copyDir(src, dest, options) {
    if (!(0, fs_1.existsSync)(dest)) {
        (0, fs_1.mkdirSync)(dest, { recursive: true });
    }
    const entries = (0, fs_1.readdirSync)(src);
    for (const entry of entries) {
        const srcPath = (0, path_1.join)(src, entry);
        const stat = (0, fs_1.statSync)(srcPath);
        if (stat.isDirectory()) {
            copyDir(srcPath, (0, path_1.join)(dest, entry), options);
            continue;
        }
        const ejsMatch = entry.match(/^(.+)\.ejs$/);
        if (ejsMatch) {
            const destPath = (0, path_1.join)(dest, ejsMatch[1]);
            (0, ejs_1.renderFile)(srcPath, options, {}, (err, str) => {
                if (err) {
                    console.error(`Error rendering ${srcPath}:`, err.message);
                    throw err;
                }
                if (str && str.trim()) {
                    (0, fs_1.writeFileSync)(destPath, str, 'utf-8');
                }
            });
        }
        else {
            const destPath = (0, path_1.join)(dest, entry);
            (0, fs_1.copyFileSync)(srcPath, destPath);
        }
    }
}
function installDependencies(projectDir, packageManager) {
    const installCmd = {
        npm: 'npm install',
        yarn: 'yarn',
        pnpm: 'pnpm install'
    };
    if (packageManager === 'skip')
        return true;
    const cmd = installCmd[packageManager];
    if (!cmd)
        return true;
    try {
        (0, child_process_1.execSync)(cmd, { cwd: projectDir, stdio: 'inherit' });
        return true;
    }
    catch {
        console.error(`依赖安装失败，请手动在项目目录执行 ${cmd}`);
        return false;
    }
}
async function run() {
    commander_1.program
        .name('create-chrome-ext-vue')
        .description('Chrome Extension 开发脚手架（基于 Vue 3 + TypeScript + Webpack）')
        .argument('[project-name]', '项目名称（默认取当前目录名）')
        .action(async (projectName) => {
        const targetDir = projectName ? (0, path_1.join)(process.cwd(), projectName) : process.cwd();
        if ((0, fs_1.existsSync)(targetDir) && (0, fs_1.readdirSync)(targetDir).length > 0 && projectName) {
            console.error(`目录 "${targetDir}" 不为空，请选择一个空目录或新目录名`);
            process.exit(1);
        }
        const opts = await (0, questions_1.askQuestions)(targetDir);
        if (!opts) {
            process.exit(0);
        }
        const renderSpinner = (0, prompts_1.spinner)();
        renderSpinner.start('正在生成项目文件...');
        try {
            const templateOpts = {
                name: opts.name,
                description: opts.description,
                hasSidePanel: opts.hasSidePanel,
                hasDevTools: opts.hasDevTools,
                hasTab: opts.hasTab,
                hasWebview: opts.hasWebview,
                hasContentScript: opts.hasContentScript,
                hasDemo: opts.hasDemo
            };
            copyDir(TEMPLATE_DIR, targetDir, templateOpts);
            renderSpinner.stop('项目文件生成完成');
            if (opts.packageManager !== 'skip') {
                const installSpinner = (0, prompts_1.spinner)();
                installSpinner.start(`正在安装依赖（${opts.packageManager}）...`);
                const success = installDependencies(targetDir, opts.packageManager);
                if (success) {
                    installSpinner.stop('依赖安装完成');
                }
                else {
                    installSpinner.stop('依赖安装失败');
                }
            }
            (0, prompts_1.outro)(` 项目创建完成！

  进入项目:
    cd ${projectName || '.'}

  启动开发:
    npm run dev

  项目结构:
    src/
    ├── popup/           ← Popup UI（Vue 3）
    ├── background/      ← Service Worker
    ├── content-scripts/ ← 注入脚本（ISOLATED + MAIN）
    └── modules/         ← 业务模块目录（在此开发功能）${opts.hasDemo ? `

  已包含 Demo 示例模块，打开浏览器标签页后启动插件即可测试` : ''}
`);
        }
        catch (err) {
            renderSpinner.stop('生成失败');
            console.error('错误:', err.message);
            process.exit(1);
        }
    });
    commander_1.program.parse();
}
//# sourceMappingURL=index.js.map