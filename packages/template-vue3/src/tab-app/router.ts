import { createRouter, createWebHashHistory } from 'vue-router'
import ModulePage from './views/ModulePage.vue'

const routes = [
  {
    path: '/module/:moduleName/:subPath*',
    name: 'module',
    component: ModulePage
  },
  {
    path: '/module/:moduleName',
    name: 'module-base',
    component: ModulePage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
