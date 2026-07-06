import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/iconfont/iconfont.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/src/index.scss'
import { storage } from '@chrome-ext-vue/core'
import { initTheme } from './composables/useTheme'

const STORAGE_KEY = 'popup_last_route'

const app = createApp(App)
app.use(router)

// 初始化主题（从 storage 读取偏好，设置 html class）
initTheme()

// 恢复上次路由缓存
;(async () => {
  const lastRoute = (await storage.get(STORAGE_KEY)) as string | undefined
  if (lastRoute) {
    const matched = router.getRoutes().some(route => {
      const regex = route.path.replace(/:\w+/g, '[^/]+')
      return new RegExp(`^${regex}$`).test(lastRoute)
    })
    if (matched) {
      router.replace(lastRoute)
    }
  }

  // 每次路由变化时保存当前路径
  router.afterEach(to => {
    storage.set(STORAGE_KEY, to.path)
  })

  app.mount('#app')
})()
