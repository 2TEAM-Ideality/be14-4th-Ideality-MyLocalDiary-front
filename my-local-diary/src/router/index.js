import { createRouter, createWebHistory } from 'vue-router'
import Mypage from '@/views/Mypage.vue'
import Landingpage from '@/views/Landingpage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Landingpage, // 처음 화면을 랜딩페이지로 보이게 하려면 이거!
      },
  {
    path: '/mypage',
    name: 'Mypage',
    component: Mypage,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
