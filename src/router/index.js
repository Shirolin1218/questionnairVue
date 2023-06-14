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
      component: () => import('../views/WriteView.vue'),
    },
    {
      path: '/statistic',
      name: 'Statistic',
      component: () => import('../views/StatisticView.vue'),
    },
  ]
})

export default router
