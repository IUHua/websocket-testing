// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [{ path: '/', component: () => import('../views/Home.vue') }]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
