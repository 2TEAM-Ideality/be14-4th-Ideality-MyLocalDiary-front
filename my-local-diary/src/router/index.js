import { createRouter, createWebHistory } from 'vue-router'
import Mypage from '@/views/Mypage.vue'
import Landingpage from '@/views/Landingpage.vue';
import MapHome from '@/views/MapHome.vue'; 

const routes = [
    {
        path: '/',
        name: 'Landing',
        // beforeEnter: (to, from, next) => {
        //   if (isLoggedIn()) {
        //     next('/dashboard'); // 로그인한 유저는 대시보드로
        //   } else {
        //     next(); // 로그인 안 한 유저는 랜딩 페이지
        //   }
        // },
        component: Landingpage, // 처음 화면을 랜딩페이지로 보이게 하려면 이거!
        meta: {
          hideSidebar: true   // 랜딩페이지의 경우 사이드 바 숨기기
        }
      },
    {
      path: '/mypage',
      name: 'Mypage',
      component: Mypage,
    },
    {
      path: '/map-home',
      name: 'MapHome',
      component : MapHome
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
