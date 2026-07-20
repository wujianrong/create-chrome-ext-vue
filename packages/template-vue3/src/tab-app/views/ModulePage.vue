<template>
  <div class="module-page">
    <header v-if="moduleMeta" class="module-header">
      <div class="module-header-left">
        <div class="module-header-brand">
          <span class="brand-icon">&#9670;</span>
          <span class="brand-text">高频工具盒</span>
        </div>
        <div class="module-header-info">
          <h1 class="module-header-title">{{ moduleMeta.label }}</h1>
          <p v-if="moduleMeta.description" class="module-header-desc">{{ moduleMeta.description }}</p>
        </div>
      </div>
      <button class="module-header-theme-btn" :title="themeTooltip" @click="toggleTheme">
        <el-icon size="16px"><component :is="themeIcon" /></el-icon>
      </button>
    </header>
    <main class="module-content">
      <div v-if="error" class="module-not-found">{{ error }}</div>
      <component v-else-if="ModuleComponent" :is="ModuleComponent" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, onMounted, provide, watch } from 'vue'
import { ElIcon } from 'element-plus'
import { Sunny, Moon } from '@element-plus/icons-vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Component } from 'vue'
import type { IModule } from '@/core'
import { moduleRegistry } from '@/core'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const moduleName = computed(() => route.params.moduleName as string)

const moduleMeta = ref<IModule | null>(null)
const ModuleComponent = shallowRef<Component | null>(null)
const error = ref('')

const { theme, toggleTheme } = useTheme()
const themeIcon = computed(() => (theme.value === 'dark' ? Moon : Sunny))
const themeTooltip = computed(() => (theme.value === 'dark' ? '切换浅色主题' : '切换深色主题'))

// 注入 IModule 元数据供子组件使用
provide<Ref<IModule | null>>('moduleMeta', moduleMeta)

// 根据模块名称动态更新浏览器页签标题
watch(
  moduleMeta,
  meta => {
    document.title = meta?.label || '高频工具盒'
  },
  { immediate: true }
)

onMounted(async () => {
  const raw = moduleRegistry.getModule(moduleName.value)
  if (!raw?.route) {
    error.value = `模块 "${moduleName.value}" 未找到或未注册`
    return
  }
  moduleMeta.value = raw
  try {
    const comp =
      typeof raw.route.component === 'function'
        ? await (raw.route.component as () => Promise<any>)()
        : raw.route.component
    ModuleComponent.value = (comp as any).default || comp
  } catch (e: any) {
    error.value = `加载模块失败: ${e.message || e}`
  }
})
</script>

<style lang="scss" scoped>
.module-page {
  width: 100%;
  min-height: 100vh;
}
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}
.module-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}
.module-header-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: bold;
  color: var(--text-secondary);
  padding-right: 16px;
  border-right: 1px solid var(--border-color);
}
.brand-icon {
  color: var(--accent-red);
  font-size: 14px;
}
.module-header-theme-btn {
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
  flex-shrink: 0;

  &:hover {
    color: var(--accent-blue);
  }
}
.module-header-info {
  min-width: 0;
}
.module-header-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.module-header-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.module-content {
  height: 100vh;
}
.module-not-found {
  padding: 40px 20px;
  color: var(--text-secondary);
  text-align: center;
  font-size: 14px;
}
</style>
