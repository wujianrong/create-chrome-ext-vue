<!-- src/popup/views/index/index.vue -->
<template>
  <div class="demo-box">
    <div class="result">{{ result }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Base } from '@/core'

const base = new Base()
const result = ref('')
const loading = ref(false)

// 存储操作
const handleSave = async () => {
  await base.g_storage.set('testKey', { name: '测试数据', time: Date.now() })
  ElMessage.success('存储成功')
}

const handleGet = async () => {
  const data = await base.g_storage.get('testKey')
  result.value = JSON.stringify(data, null, 2)
}

// 标签页操作
const handleOpenTab = async () => {
  await base.g_tabs.create('https://www.baidu.com')
}

// 弹窗通知
const handleNotification = () => {
  ElMessage.info('这是一条信息提示')
}

// HTTP 请求
const handleRequest = async () => {
  loading.value = true
  result.value = ''

  try {
    const response = await base.g_proxy_http.get('https://jsonplaceholder.typicode.com/todos/1')
    result.value = JSON.stringify(response.data, null, 2)
    ElMessage.success('请求成功')
  } catch (error) {
    ElMessage.error('请求失败')
    result.value = `错误: ${error instanceof Error ? error.message : '未知错误'}`
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.demo-box {
  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0;
  }

  button {
    padding: 10px 20px;
    cursor: pointer;
  }

  .result {
    margin-top: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
    white-space: pre-wrap;
  }
}
</style>
