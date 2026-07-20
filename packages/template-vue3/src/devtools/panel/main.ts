import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/iconfont/iconfont.css'
import 'element-plus/theme-chalk/src/index.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../styles/theme-variables.scss'
import { initTheme } from '../composables/useTheme'

// 初始化主题（从 storage 读取偏好，设置 html class）
initTheme()

createApp(App).use(router).mount('#app')
