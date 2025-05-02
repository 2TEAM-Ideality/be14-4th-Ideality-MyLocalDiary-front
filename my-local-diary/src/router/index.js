import { createRouter, createWebHistory } from 'vue-router'
import Mypage from '@/views/mypage/Mypage.vue'
import Landingpage from '@/views/Landingpage.vue';
import MapHome from '@/views/MapHome.vue';
import StampPage from '@/views/Stamppage.vue';
import UserMapView from '@/views/UserMapView.vue';
import PostCreate from '@/components/post/PostCreate.vue'
import TestMarker from '@/views/TestMarker.vue';
import EditProfile from '@/components/mypage/EditProfile.vue'
import EditAccount from '@/components/mypage/EditAccount.vue';
import TempLoadingModalParent from '@/components/common/TempLoadingModalParent.vue';
import EditPage from '@/views/mypage/EditPage.vue';
import ReportManagement from '@/views/admin/ReportManagement.vue';
import RegulationHistory from '@/views/admin/RegulationHistory.vue';
import AdminMyPage from '@/views/admin/AdminMyPage.vue';
import { useUserStore } from '@/stores/userStore';

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
    component: MapHome
  },
  {
    path: '/home',
    name: 'MapHome',
    component: MapHome
  },
  {
    path: '/marker',
    name: 'TestMarker',
    component: TestMarker
  },
  {
    path: '/mypage/:id',
    name: 'Mypage',
    component: Mypage,
    props: true
  },

  {
    path: '/edit',
    component: EditPage,  // EditPage 내부에서 분기
    children: [
      {
        path: 'profile',
        component: EditProfile
      },
      {
        path: 'account',
        component: EditAccount
      }
    ]
  },
  {
    path: '/stamp/:id',
    name: 'Stamp',
    component: StampPage,
    props: true
  },
  {
    path: '/map/:id',
    name: 'UserMapHome',
    component: UserMapView,
  },
  {
    path: '/post/create',
    name: 'PostCreate',
    component: PostCreate
  },
  {
    path: '/loadingmodal',
    name: 'LoadingModal',
    component: TempLoadingModalParent
  },

  // 관리자용 
  {
    path: '/admin/reports',
    name: 'ReportManagement',
    component: ReportManagement
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: Mypage // 🔥 임시로(팔로우기능중...)
  },

  {
    path: '/admin/regulations',
    name: 'RegulationHistory',
    component: RegulationHistory
  },
  {
    path: '/admin/mypage',
    name: 'AdminMyPage',
    component: AdminMyPage
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router/index.js 또는 router 설정파일
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.token && !userStore.id) {
    await userStore.restoreUser()
  }

  const requiresAuth = to.meta.requiresAuth || to.path !== '/' // 예시 조건
  const isAuthenticated = !!userStore.id

  if (requiresAuth && !isAuthenticated) {
    return next('/') // 로그인 페이지
  }

  next()
})

export default router
