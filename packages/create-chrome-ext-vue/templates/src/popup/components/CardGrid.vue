<template>
  <div v-for="(items, category) in groupedModules" :key="category" class="card-group">
    <div class="card-group-title">{{ category }}</div>
    <div class="card-grid">
      <ModuleCard v-for="m in items" :key="m.name" :module="m" @select="emitSelect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ModuleCard from './ModuleCard.vue'
import type { ModuleMeta } from '@chrome-ext-vue/core'

const props = defineProps<{
  modules: ModuleMeta[]
}>()

const emit = defineEmits<{
  select: [module: ModuleMeta]
}>()

const groupedModules = computed(() => {
  const groups: Record<string, ModuleMeta[]> = {}
  for (const m of props.modules) {
    const cat = m.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(m)
  }
  return groups
})

function emitSelect(module: ModuleMeta) {
  emit('select', module)
}
</script>

<style lang="scss" scoped>
.card-group {
  margin-bottom: 12px;
}
.card-group-title {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 4px 0 6px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 400px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
