import { createRouter, createWebHistory } from "vue-router";
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/manage',
      name: 'Manage',
      component: () => import('../views/ManageView.vue')
    },
    {
      path: '/reporter',
      name: 'Reporter',
      component: () => import('../views/ReporterView.vue')
    },
    {
      path: '/write',
      name: 'Write',
      component: () => import('../views/WriteView.vue')
    },
  ]
})

export default router
