import { createRouter, createWebHashHistory } from 'vue-router'
import '../modules' // import 时自动完成模块注册
import HomePage from './views/HomePage.vue'
import ModulePage from './views/ModulePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/module/:moduleName', name: 'module', component: ModulePage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
