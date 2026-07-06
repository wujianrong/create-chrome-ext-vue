<template>
  <div class="demo-container">
    <h2>Demo 示例 — 页面标题提取器</h2>
    <p class="demo-desc">
      点击按钮，通过 Channel → Background → Content Script → CrossWorldBridge
      三层通信链路，读取当前标签页的页面标题。
    </p>

    <el-button type="primary" @click="handleGetTitle" :loading="loading">
      {{ loading ? '获取中...' : '获取页面标题' }}
    </el-button>

    <div v-if="result" class="result-card">
      <div class="result-section">
        <h3>通信流程</h3>
        <div class="flow-diagram">
          <div class="flow-step">
            <el-tag type="primary">1. Popup</el-tag>
            <span>点击按钮</span>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <el-tag type="success">2. Channel</el-tag>
            <span>Popup → Background → ContentScript</span>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <el-tag type="warning">3. Bridge</el-tag>
            <span>ISOLATED → MAIN world</span>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <el-tag type="danger">4. MAIN</el-tag>
            <span>读取 document.title</span>
          </div>
        </div>
      </div>

      <div class="result-section">
        <h3>返回结果</h3>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="页面标题">{{ result.title }}</el-descriptions-item>
          <el-descriptions-item label="页面 URL">{{ result.url }}</el-descriptions-item>
          <el-descriptions-item label="时间戳">{{ result.timestamp }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <div v-if="error" class="error-msg">
      <el-alert :title="error" type="error" show-icon :closable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag, ElDescriptions, ElDescriptionsItem, ElAlert, ElMessage } from 'element-plus'
import { channelPopup, ChannelType } from '@chrome-ext-vue/core'

interface PageInfo {
  title: string
  url: string
  timestamp: number
}

const loading = ref(false)
const result = ref<PageInfo | null>(null)
const error = ref('')

async function handleGetTitle(): Promise<void> {
  loading.value = true
  error.value = ''
  result.value = null

  try {
    const data = await channelPopup.request(ChannelType.CONTENT, {}, 'DEMO_GET_PAGE_TITLE')
    result.value = data as PageInfo
    ElMessage.success('通信成功！')
  } catch (e: any) {
    error.value = e?.message || '通信失败，请确保已打开一个网页标签页'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 16px;

  h2 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .demo-desc {
    color: #909399;
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .result-card {
    margin-top: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }

  .result-section {
    margin-bottom: 16px;

    h3 {
      font-size: 14px;
      margin-bottom: 8px;
      color: #303133;
    }
  }

  .flow-diagram {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 12px;
    background: #fff;
    border-radius: 6px;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    color: #606266;
  }

  .flow-arrow {
    color: #c0c4cc;
    font-weight: bold;
  }

  .error-msg {
    margin-top: 16px;
  }
}
</style>
