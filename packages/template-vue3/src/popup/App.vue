<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 深色主题 */
:root.theme-dark {
  /* 背景色 */
  --bg-deep: #0f0c29;
  --bg-mid: #302b63;
  --bg-light: #24243e;
  --bg-gradient: linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  /* 玻璃卡片 */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover-bg: rgba(255, 255, 255, 0.1);
  --glass-hover-border: rgba(255, 0, 255, 0.4);
  --glass-hover-shadow: 0 4px 24px rgba(255, 0, 255, 0.12);
  /* 强调色 */
  --accent: #eb28eb;
  --accent-dim: rgba(255, 0, 255, 0.1);
  --accent-glow: 0 0 10px rgba(255, 0, 255, 0.5);
  /* 文字色 */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.45);
  /* 玻璃菜单面板背景 */
  --glass-menu-bg: rgba(15, 12, 41, 0.92);
}

/* 浅色主题（浅紫镜像） */
:root.theme-light {
  /* 背景色 */
  --bg-deep: #f5f0ff;
  --bg-mid: #e8e0f5;
  --bg-light: #faf8ff;
  --bg-gradient: linear-gradient(160deg, #f5f0ff 0%, #e8e0f5 50%, #faf8ff 100%);
  /* 玻璃卡片 */
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-hover-bg: rgba(255, 255, 255, 0.9);
  --glass-hover-border: rgba(0, 0, 0, 0.1);
  --glass-hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  /* 强调色 */
  --accent: #8b1e8b;
  --accent-dim: rgba(139, 30, 139, 0.1);
  --accent-glow: none;
  /* 文字色 */
  --text-primary: #1a1040;
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-muted: rgba(0, 0, 0, 0.4);
  /* 玻璃菜单面板背景 */
  --glass-menu-bg: rgba(245, 240, 255, 0.92);
}

#app {
  font-size: 14px;
  min-width: 500px;
  min-height: 600px;
}
.app-container {
  width: 100%;
  height: 100vh;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body {
  margin: 0;
  padding: 0;
  background: var(--bg-gradient);
  color: var(--text-primary);
}

/* Element Plus 暗黑模式自定义变量覆盖（仅在深色主题时生效） */
html.theme-dark {
  --el-color-primary: #ff00ff;
  --el-color-primary-light-3: rgba(255, 0, 255, 0.7);
  --el-color-primary-light-5: rgba(255, 0, 255, 0.5);
  --el-color-primary-light-7: rgba(255, 0, 255, 0.25);
  --el-color-primary-light-8: rgba(255, 0, 255, 0.15);
  --el-color-primary-light-9: rgba(255, 0, 255, 0.08);
  --el-color-primary-dark-2: rgba(255, 0, 255, 0.9);
  --el-bg-color: #110f25;
  --el-bg-color-page: #0f0c29;
  --el-bg-color-overlay: #1a1744;
  --el-border-color: rgba(255, 255, 255, 0.08);
  --el-border-color-light: rgba(255, 255, 255, 0.05);
  --el-border-color-lighter: rgba(255, 255, 255, 0.03);
  --el-fill-color: rgba(255, 255, 255, 0.05);
  --el-fill-color-light: rgba(255, 255, 255, 0.08);
  --el-fill-color-blank: transparent;
}
</style>
