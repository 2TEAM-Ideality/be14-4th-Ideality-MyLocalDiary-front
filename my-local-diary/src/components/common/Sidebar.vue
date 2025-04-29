<template>
  <VNavigationDrawer
    v-model="drawer"
    app
    :width="ui.isHover ? 200 : 80"
    permanent
    class="pa-2"
    @mouseenter="ui.hoverSidebar"
    @mouseleave="ui.leaveSidebar"
  >
    <v-list nav dense class="d-flex flex-column justify-space-between fill-height">
      <div>
        <!-- 로고 -->
        <v-list-item>
          <div class="logo-container">
            <v-img
              v-if="!ui.isHover"
              src="/src/assets/cursor/슈크림붕어빵1.png"
              width="40"
            />
            <transition name="fade">
              <v-img
                v-if="ui.showImage"
                src="/src/assets/logo/My_Local_Diary.png"
              />
            </transition>
          </div>
        </v-list-item>

        <!-- ✨ 메뉴 항목 -->
        <template v-if="!isAdmin">
          <v-list-item @click="goToHome">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/Map.png" class="menu-icon" />
              <span v-if="ui.showText">지도 홈</span>
            </div>
          </v-list-item>

          <v-list-item @click="openUserSearch">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/Search.png" class="menu-icon" />
              <span v-if="ui.showText">검색</span>
            </div>
          </v-list-item>

          <v-list-item @click="goToMypage">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/person.png" class="menu-icon" />
              <span v-if="ui.showText">마이페이지</span>
            </div>
          </v-list-item>

          <v-list-item @click="goToCreateDiary">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/Pen.png" class="menu-icon" />
              <span v-if="ui.showText">글쓰기</span>
            </div>
          </v-list-item>

          <v-list-item @click="goToStamp">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/stamp.png" class="stamp-icon ml-n1" />
              <span v-if="ui.showText">스탬프 목록</span>
            </div>
          </v-list-item>

          <v-list-item @click="openAlarm">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/notifications.png" class="menu-icon" />
              <span v-if="ui.showText">알림</span>
            </div>
          </v-list-item>
        </template>

        <!-- ✨ 관리자 메뉴 -->
        <template v-else>
          <v-list-item @click="goToRegulationHistory">
            <div class="menu-item">
              <v-icon>mdi-file-document</v-icon>
              <span v-if="ui.showText" class="ml-2">규제 히스토리</span>
            </div>
          </v-list-item>

          <v-list-item @click="goToReportHistory">
            <div class="menu-item">
              <v-icon>mdi-alert-circle-outline</v-icon>
              <span v-if="ui.showText" class="ml-2">신고 내역</span>
            </div>
          </v-list-item>

          <v-list-item @click="goToAdminMyPage">
            <div class="menu-item">
              <v-img src="/src/assets/sidebar/person.png" class="menu-icon" />
              <span v-if="ui.showText">대시보드</span>
            </div>
          </v-list-item>
        </template>
      </div>

      <!-- 더보기 -->
      <v-menu v-model="showMoreMenu" location="top" offset-y>
        <template #activator="{ props }">
          <v-list-item v-bind="props">
            <div class="menu-item">
              <v-icon>mdi-dots-horizontal</v-icon>
              <span v-if="ui.showText" class="ml-2">더 보기</span>
            </div>
          </v-list-item>
        </template>

        <v-list>
          <v-list-item title="설정" prepend-icon="mdi-cog" @click="goToSettings" />
          <v-list-item title="내 활동" prepend-icon="mdi-history" @click="goToActivities" />
          <v-list-item title="문제 신고" prepend-icon="mdi-alert-circle-outline" @click="reportProblem" />
          <v-divider></v-divider>
          <v-list-item title="로그아웃" @click="confirmLogout" />
        </v-list>
      </v-menu>
    </v-list>
  </VNavigationDrawer>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore';

const router = useRouter()
const drawer = ref(true)
const ui = useUIStore()
const showMoreMenu = ref(false)

const isAdmin = ref(true)  // 관리자 테스트용
const userStore = useUserStore();

onMounted(async () => {
  const userStore = useUserStore();
  await userStore.restoreUser();

  // isAdmin.value = userStore.role === 'ADMIN' // 관리자 여부 판별 
})

// 라우팅 
const goToHome = () => router.push('/home')
const goToMypage = () => router.push('/mypage')
const goToCreateDiary = () => router.push('/post/create')
const goToStamp = () => router.push('/stamp')
const openUserSearch = () => console.log('유저 검색 창 뜨기')
const openAlarm = () => console.log('알림 창 뜨기')

const goToSettings = () => router.push('/settings')
const goToActivities = () => router.push('/activities')
const reportProblem = () => console.log('문제 신고 창 열기')
const confirmLogout = () => {
  if (confirm('정말 로그아웃 하시겠습니까?')) {
    // 실제 로그아웃 로직 추가할 자리
    console.log('로그아웃 완료')
    router.push('/')
  }
}

// 관리자용 라우팅
const goToRegulationHistory = () => router.push('/admin/regulations')
const goToReportHistory = () => router.push('/admin/reports')
const goToAdminMyPage = () => router.push('/admin/mypage')
</script>

<style scoped>
:deep(.v-navigation-drawer) {
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
}

.menu-icon {
  width: 25px;
  height: 25px;
  min-width: 25px;
  max-width: 25px;
  flex-shrink: 0;
  margin-right: 8px;
  object-fit: contain;
}

.stamp-icon {
  width: 35px;
  height: 35px;
  min-width: 35px;
  max-width: 35px;
  flex-shrink: 0;
  margin-right: 8px;
  object-fit: contain;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>