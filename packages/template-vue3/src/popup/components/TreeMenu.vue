<template>
  <div class="tree-menu-trigger" ref="triggerRef">
    <button class="tree-menu-btn" @click="toggleMenu">
      <i class="iconfont icon-condition-caidan"></i>
    </button>
    <Teleport to="body">
      <div v-if="visible" class="glass-menu-overlay" @click="closeMenu">
        <div class="glass-menu-panel" :style="panelStyle" @click.stop>
          <div class="glass-menu-item glass-menu-home" @click="handleHome">
            <i class="iconfont icon-condition-homefill"></i>
            <span class="glass-menu-label">首页</span>
          </div>
          <div class="glass-menu-divider" />
          <template v-for="(items, category) in groupedModules" :key="category">
            <div class="glass-menu-category">{{ category }}</div>
            <div v-for="m in items" :key="m.name" class="glass-menu-item" @click="handleSelect(m)">
              <i v-if="m.icon && m.icon.startsWith('icon-')" :class="['iconfont', m.icon]"></i>
              <el-icon v-else-if="m.icon" size="14px"><component :is="m.icon" /></el-icon>
              <span class="glass-menu-label">{{ m.label }}</span>
              <span v-if="m.actionType === 'tab'" class="glass-menu-badge" title="新标签页打开">↗</span>
              <span v-else-if="m.actionType === 'devtools'" class="glass-menu-badge" title="DevTools">🛠</span>
              <span v-else-if="m.actionType === 'sidepanel'" class="glass-menu-badge" title="SidePanel">📑</span>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElIcon } from 'element-plus'
import type { ModuleMeta } from '@/core'

const props = defineProps<{
  modules: ModuleMeta[]
}>()

const emit = defineEmits<{
  select: [module: ModuleMeta]
}>()

const router = useRouter()
const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const groupedModules = computed(() => {
  const groups: Record<string, ModuleMeta[]> = {}
  for (const m of props.modules) {
    const cat = m.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(m)
  }
  return groups
})

/** 面板定位在按钮右下角 */
const panelStyle = computed(() => {
  if (!triggerRef.value) return {}
  const rect = triggerRef.value.getBoundingClientRect()
  return {
    position: 'fixed' as const,
    top: rect.bottom + 4 + 'px',
    right: window.innerWidth - rect.right + 'px'
  }
})

function toggleMenu() {
  visible.value = !visible.value
}

function closeMenu() {
  visible.value = false
}

function handleHome() {
  closeMenu()
  router.push('/')
}

function handleSelect(module: ModuleMeta) {
  closeMenu()
  emit('select', module)
}
</script>

<style lang="scss" scoped>
.tree-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 24px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: color 0.2s;

  &:hover {
    color: var(--accent);
  }
}
</style>

<style lang="scss">
/* 全局样式：玻璃菜单面板（Teleport 到 body 后 scoped 失效，用独立块） */
.glass-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.glass-menu-panel {
  width: 220px;
  padding: 8px;
  background: var(--glass-menu-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), var(--glass-hover-shadow);
}

.glass-menu-category {
  font-size: 12px;
  color: var(--text-muted);
  padding: 6px 8px 2px;
  font-weight: 500;
  text-transform: uppercase;
}

.glass-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-dim);
    color: var(--accent);
  }
}

.glass-menu-label {
  flex: 1;
}

.glass-menu-badge {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.glass-menu-home {
  margin-bottom: 0;
}

.glass-menu-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 4px 8px;
}
</style>
