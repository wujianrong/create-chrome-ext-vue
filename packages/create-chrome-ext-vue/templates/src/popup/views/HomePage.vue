<template>
  <div class="home-page">
    <header class="home-header">
      <div class="title-group">
        <span class="title">{{ projectName }}</span>
      </div>
      <div class="header-actions">
        <button class="theme-toggle-btn" :title="themeTooltip" @click="toggleTheme">
          <el-icon size="18px"><component :is="themeIcon" /></el-icon>
        </button>
        <TreeMenu :modules="modules" @select="handleMenuSelect" />
      </div>
    </header>
    <section class="home-content">
      <CardGrid :modules="modules" @select="handleCardSelect" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElIcon } from 'element-plus'
import { Sunny, Moon } from '@element-plus/icons-vue'
import TreeMenu from '../components/TreeMenu.vue'
import CardGrid from '../components/CardGrid.vue'
import { moduleRegistry } from '@chrome-ext-vue/core'
import type { ModuleMeta } from '@chrome-ext-vue/core'
import { handleModuleAction } from '../utils/module-action'
import { useTheme } from '../composables/useTheme'

const projectName = 'Chrome Extension'

const router = useRouter()
const modules = moduleRegistry.getModules()
const { theme, toggleTheme } = useTheme()

const themeIcon = computed(() => theme.value === 'dark' ? Moon : Sunny)
const themeTooltip = computed(() => theme.value === 'dark' ? '切换浅色主题' : '切换深色主题')

function navigateModule(module: ModuleMeta) {
  handleModuleAction(module, router)
}

function handleMenuSelect(module: ModuleMeta) {
  navigateModule(module)
}

function handleCardSelect(module: ModuleMeta) {
  navigateModule(module)
}
</script>

<style lang="scss" scoped>
.home-page {
  height: 100%;
}
.home-header {
  padding: 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    text-shadow: var(--accent-glow);
  }
}
.title-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: color 0.2s;
  font-size: 0;

  &:hover {
    color: var(--accent);
  }
}
.home-content {
  padding: 0 14px 6px;
}
</style>
