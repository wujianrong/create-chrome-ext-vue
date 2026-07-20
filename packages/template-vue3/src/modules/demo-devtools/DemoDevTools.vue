<template>
  <div class="demo-devtools">
    <div class="info-section">
      <h2 class="section-title">当前标签页信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">URL</span>
          <span class="info-value">{{ pageInfo.url || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">标题</span>
          <span class="info-value">{{ pageInfo.title || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">标签页 ID</span>
          <span class="info-value">{{ pageInfo.tabId || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h2 class="section-title">扩展信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">扩展 ID</span>
          <span class="info-value">{{ extInfo.id || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">版本</span>
          <span class="info-value">{{ extInfo.version || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h2 class="section-title">DevTools 面板状态</h2>
      <div class="status-indicator">
        <span class="status-dot" :class="loaded ? 'active' : 'inactive'"></span>
        <span>{{ loaded ? '面板加载完成' : '加载中...' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loaded = ref(false)

const pageInfo = ref({
  url: '',
  title: '',
  tabId: ''
})

const extInfo = ref({
  id: '',
  version: ''
})

onMounted(async () => {
  try {
    // 获取当前激活的标签页信息
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab) {
      pageInfo.value = {
        url: tab.url || '',
        title: tab.title || '',
        tabId: String(tab.id || '')
      }
    }

    // 获取扩展信息
    const manifest = chrome.runtime.getManifest()
    extInfo.value = {
      id: chrome.runtime.id,
      version: manifest.version
    }
  } catch (e: any) {
    console.warn('[DemoDevTools] 获取信息失败:', e.message)
  } finally {
    loaded.value = true
  }
})
</script>

<style lang="scss" scoped>
.demo-devtools {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.info-section {
  margin-bottom: 20px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
}

.info-label {
  min-width: 80px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-value {
  font-size: 12px;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.5;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-primary);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;

  &.active {
    background-color: var(--accent-green);
  }

  &.inactive {
    background-color: var(--accent-gray);
  }
}
</style>
