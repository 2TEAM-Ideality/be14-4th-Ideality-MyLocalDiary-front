import { createRouter, createWebHistory } from 'vue-router'
import Mypage from '@/views/Mypage.vue'
import Landingpage from '@/views/Landingpage.vue';

const routes = [
  {
    path: '/mypage',
    name: 'Mypage',
    component: Mypage,
  },
  {
    path: '/landingpage',
    name: 'Landingpage',
    component: Landingpage,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
