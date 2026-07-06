<template>
  <div class="tool-card" @click="$emit('select', module)">
    <div class="icon-wrapper">
      <i v-if="module.icon && module.icon.startsWith('icon-')" :class="['iconfont', module.icon]"></i>
      <el-icon v-else-if="module.icon" size="26px">
        <component :is="module.icon" />
      </el-icon>
    </div>
    <div class="tool-info">
      <div class="tool-name">{{ module.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import type { ModuleMeta } from '@chrome-ext-vue/core'

defineProps<{
  module: ModuleMeta
}>()

defineEmits<{
  select: [module: ModuleMeta]
}>()
</script>

<style lang="scss" scoped>
.tool-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px;
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  transition: all 0.3s ease;
  color: var(--text-primary);

  &:hover {
    transform: translateY(-8px);
    background: var(--glass-hover-bg);
    border-color: var(--glass-hover-border);
    box-shadow: var(--glass-hover-shadow);
  }
}

.icon-wrapper {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-dim);
  border-radius: 10px;
  color: var(--accent);
  font-size: 26px;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 14px;
  font-weight: 600;
}
</style>
