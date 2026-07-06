<template>
  <div class="module-page">
    <header class="module-header">
      <div class="module-header-left">
        <el-button link type="primary" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-breadcrumb separator=">">
          <el-breadcrumb-item v-if="moduleMeta?.category" @click="goHome">
            {{ moduleMeta.category }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            {{ moduleMeta?.label || moduleName }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <button class="theme-toggle-btn" :title="themeTooltip" @click="toggleTheme">
          <el-icon size="18px"><component :is="themeIcon" /></el-icon>
        </button>
        <TreeMenu :modules="allModules" @select="handleMenuSelect" />
      </div>
    </header>
    <section v-if="moduleMeta" class="module-banner">
      <h1 class="module-banner-title">{{ moduleMeta.label }}</h1>
      <p v-if="moduleMeta.description" class="module-banner-desc">{{ moduleMeta.description }}</p>
    </section>
    <main class="module-content">
      <component v-if="ModuleComponent" :is="ModuleComponent" />
      <div v-else class="module-not-found">模块 "{{ moduleName }}" 未找到或未注册</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Sunny, Moon } from '@element-plus/icons-vue'
import { ElButton, ElIcon, ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'
import type { Component } from 'vue'
import TreeMenu from '../components/TreeMenu.vue'
import { moduleRegistry } from '@chrome-ext-vue/core'
import type { ModuleMeta } from '@chrome-ext-vue/core'
import { handleModuleAction } from '../utils/module-action'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const router = useRouter()
const allModules = moduleRegistry.getModules()
const { theme, toggleTheme } = useTheme()

const themeIcon = computed(() => theme.value === 'dark' ? Moon : Sunny)
const themeTooltip = computed(() => theme.value === 'dark' ? '切换浅色主题' : '切换深色主题')

const moduleName = computed(() => route.params.moduleName as string)

const moduleMeta = computed<ModuleMeta | undefined>(() => allModules.find(m => m.name === moduleName.value))

const ModuleComponent = shallowRef<Component | null>(null)

watchEffect(async () => {
  const raw = moduleRegistry.getModule(moduleName.value)
  if (!raw?.route) {
    ModuleComponent.value = null
    return
  }
  const comp =
    typeof raw.route.component === 'function'
      ? await (raw.route.component as () => Promise<any>)()
      : raw.route.component
  ModuleComponent.value = (comp as any).default || comp
})

function goBack() {
  router.push('/')
}

function goHome() {
  router.push('/')
}

function handleMenuSelect(module: ModuleMeta) {
  handleModuleAction(module, router)
}
</script>

<style lang="scss" scoped>
.module-page {
  width: 100%;
  height: 100vh;
}
.module-header {
  padding: 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.module-header-left {
  display: flex;
  align-items: center;
  gap: 4px;

  :deep(.el-button) {
    color: var(--text-secondary);
    &:hover {
      color: var(--accent);
    }
  }

  :deep(.el-breadcrumb) {
    .el-breadcrumb__item {
      .el-breadcrumb__inner {
        color: var(--text-muted);
        font-weight: 400;
        &.is-link {
          color: var(--text-secondary);
          &:hover {
            color: var(--accent);
          }
        }
      }
    }
    .el-breadcrumb__separator {
      color: var(--text-muted);
    }
  }
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
.module-banner {
  padding: 10px 12px;
  border-bottom: 1px solid var(--glass-border);
}
.module-banner-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.module-banner-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.module-content {
  padding: 0 6px 6px;
}
.module-not-found {
  padding: 20px;
  color: var(--text-muted);
  text-align: center;
}
</style>
