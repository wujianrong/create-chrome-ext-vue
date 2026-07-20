import { createRouter, createWebHashHistory } from 'vue-router'
import ModulePage from './App.vue'

const routes = [
  {
    path: '/module/:moduleName',
    name: 'module',
    component: ModulePage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
