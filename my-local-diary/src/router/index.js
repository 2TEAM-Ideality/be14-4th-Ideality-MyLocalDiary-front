import { createRouter, createWebHistory } from 'vue-router'
import Mypage from '@/views/Mypage.vue'
import Landingpage from '@/views/Landingpage.vue';
import MapHome from '@/views/MapHome.vue'; 
import Stamppage from '@/views/Stamppage.vue';
import CreateDiary from '@/views/CreateDiary.vue';
import UserMapView from '@/views/UserMapView.vue';

import TempLoadingModalParent from '@/components/common/TempLoadingModalParent.vue';

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
    },
    {
      path: '/stamppage',
      name: 'Stamppage',
      component : Stamppage
    },
      {
        path: '/home',
        name: 'MapHome',
        component : MapHome
      },
      {
        path: '/create-diary',
        name: 'CreateDiary',
        component : CreateDiary
      },
      {
        path: '/mypage',
        name: 'Mypage',
        component: Mypage,
      },
      {
        path: '/stamp',
        name: 'Stamp',
        component: Stamppage,
      },
      {
        path: '/user-map-home',
        name: 'UserMapHome',
        component: UserMapView,
      },
      {
        path: '/loadingmodal',
        name: 'LoadingModal',
        component: TempLoadingModalParent,
      },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
