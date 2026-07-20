<template>
  <div class="devtools-panel">
    <header v-if="moduleMeta" class="devtools-header">
      <div class="header-info">
        <h1 class="module-title">{{ moduleMeta.label }}</h1>
        <p v-if="moduleMeta.description" class="module-desc">{{ moduleMeta.description }}</p>
      </div>
      <button class="theme-btn" :title="themeTooltip" @click="toggleTheme">
        <span class="theme-icon">{{ themeIcon }}</span>
      </button>
    </header>
    <main class="devtools-content">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>
      <component :is="ModuleComponent" v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, onMounted } from 'vue'
import type { Component } from 'vue'
import { moduleRegistry } from '@/core'
import type { IModule } from '@/core'
import { useTheme } from '../composables/useTheme'

const moduleMeta = ref<IModule | null>(null)
const ModuleComponent = shallowRef<Component | null>(null)
const error = ref('')
const loading = ref(true)

const { theme, toggleTheme } = useTheme()
const themeIcon = computed(() => (theme.value === 'dark' ? '🌙' : '☀️'))
const themeTooltip = computed(() => (theme.value === 'dark' ? '切换浅色主题' : '切换深色主题'))

onMounted(async () => {
  try {
    // 从 URL 查询参数读取模块名称
    const params = new URLSearchParams(window.location.search)
    const moduleName = params.get('module') || ''

    if (!moduleName) {
      error.value = '未指定要加载的模块'
      loading.value = false
      return
    }

    // 获取模块信息
    const raw = moduleRegistry.getModule(moduleName)
    if (!raw?.route?.component) {
      error.value = `模块 "${moduleName}" 未找到或未配置组件`
      loading.value = false
      return
    }

    moduleMeta.value = raw

    // 动态加载组件
    const comp =
      typeof raw.route.component === 'function'
        ? await (raw.route.component as () => Promise<any>)()
        : raw.route.component

    ModuleComponent.value = (comp as any).default || comp
  } catch (e: any) {
    error.value = `加载失败：${e.message || e}`
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.devtools-panel {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.devtools-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  gap: 16px;
  min-width: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.module-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.theme-btn {
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
  flex-shrink: 0;

  &:hover {
    color: var(--accent-blue);
  }
}

.theme-icon {
  font-size: 16px;
}

.devtools-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--text-secondary);
  text-align: center;
  padding: 20px;
}

.loading-state p,
.error-state p {
  margin: 0;
  font-size: 14px;
}
</style>
