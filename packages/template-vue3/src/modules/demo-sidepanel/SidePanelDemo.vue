<template>
  <div class="demo-panel">
    <el-card header="SidePanel Demo">
      <p>这是一个 <strong>SidePanel</strong> 类型的模块示例。</p>
      <p class="hint">该模块通过 chrome.sidePanel API 在浏览器侧边栏中显示。</p>

      <el-divider />

      <h3>SidePanel 类型特点</h3>
      <ul>
        <li>展示在浏览器侧边栏，不会遮挡页面内容</li>
        <li>通过 chrome.storage.session 通信和状态管理</li>
        <li>适合需要常驻显示的辅助工具</li>
      </ul>

      <el-divider />

      <h3>模块定义示例</h3>
      <pre><code>const myModule: IModule = {
  name: 'my-sidepanel',
  label: '我的侧边栏',
  actionType: 'sidepanel',
  route: {
    path: '/my-sidepanel',
    component: () => import('./MyPanel.vue')
  }
}</code></pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElCard, ElDivider } from 'element-plus'
</script>

<style lang="scss" scoped>
.demo-panel {
  padding: 16px;

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
