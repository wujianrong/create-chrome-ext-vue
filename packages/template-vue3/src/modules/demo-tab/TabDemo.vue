<template>
  <div class="demo-page">
    <el-card header="Tab Demo">
      <p>这是一个 <strong>Tab</strong> 类型的模块示例。</p>
      <p class="hint">该模块通过 chrome.tabs.create() 在新标签页中打开，可作为独立的 Web 应用运行。</p>

      <el-divider />

      <h3>Tab 类型特点</h3>
      <ul>
        <li>在独立标签页中运行，不受 Popup 窗口大小限制</li>
        <li>可构建完整的 Web 应用（表格、表单、图表等）</li>
        <li>通过 Channel 与 Background 和其他组件通信</li>
        <li>可通过 composables 复用业务逻辑</li>
      </ul>

      <el-divider />

      <h3>模块定义示例</h3>
      <pre><code>const myModule: IModule = {
  name: 'my-tab-page',
  label: '我的标签页',
  actionType: 'tab',
  route: {
    path: '/my-tab-page',
    component: () => import('./MyPage.vue')
  },
  targetUrl: 'tab-app/index.html#/module/my-tab-page'
}</code></pre>

      <el-divider />

      <h3>框架能力演示</h3>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="Storage">
          <el-button size="small" type="primary" @click="handleStorageDemo">写入 / 读取测试</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="结果">{{ storageResult || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElDivider, ElDescriptions, ElDescriptionsItem, ElButton, ElMessage } from 'element-plus'
import { Base } from '@/core'

const base = new Base()
const storageResult = ref('')

async function handleStorageDemo(): Promise<void> {
  try {
    await base.g_storage.set('demo_key', { time: Date.now() })
    const data = await base.g_storage.get('demo_key')
    storageResult.value = JSON.stringify(data)
    ElMessage.success('存储测试成功')
  } catch (e: any) {
    ElMessage.error(`测试失败: ${e.message}`)
  }
}
</script>

<style lang="scss" scoped>
.demo-page {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;

  p { margin: 8px 0; color: var(--text-primary); }
  .hint { color: var(--text-secondary); font-size: 13px; }

  h3 { font-size: 14px; margin: 12px 0 8px; }

  ul {
    margin: 8px 0;
    padding-left: 20px;
    li { margin: 4px 0; font-size: 13px; color: var(--text-primary); }
  }

  pre {
    background: var(--bg-mid);
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
    code { font-size: 12px; }
  }
}
</style>
