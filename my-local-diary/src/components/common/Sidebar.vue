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
              height="40"
              aspect-ratio="1"
            />
            <transition name="fade">
              <div v-if="ui.showImage">
                <v-img
                  src="/src/assets/logo/My_Local_Diary.png"
                  width="120"
                  height="40"
                  aspect-ratio="3"
                />
              </div>
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
              <v-img src="/src/assets/sidebar/person.png" alt="mypage" class="menu-icon" />
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
            <div class="menu-item" style="position: relative;">
              <v-img src="/src/assets/sidebar/notifications.png" class="menu-icon" />
              <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
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

  <NotificationPopup
  :isOpen="isAlarmOpen"
  :notifications="notificationStore.notifications"
  @close="closeAlarm"
/>

  <SearchUserModal
  v-if="searchPanelOpen"
  class="search-user-modal"
   :style="{ left: '0px' }"
  @close="handleSearchClose"
  />

</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import NotificationPopup from '@/components/common/NotificationPopup.vue'
import SearchUserModal from '../search/SearchUserModal.vue'
import axios from 'axios'

const router = useRouter()

const ui = useUIStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const drawer = ref(true)
const showMoreMenu = ref(false)
const searchPanelOpen = ref(false)
const isAlarmOpen = ref(false)

const isAdmin = ref(false)

onMounted(async () => {
  await userStore.restoreUser()

  isAdmin.value = userStore.role === 'ADMIN'

  await notificationStore.fetchNotifications(userStore.token)
  
  // 🔁 알림 자동 갱신 (10초마다)
  setInterval(() => {
      notificationStore.fetchNotifications(userStore.token)
    }, 10000) // 10초 간격 (10000ms)
  }
)

// 알림 수 계산
const unreadCount = computed(() =>
  notificationStore.notifications.filter(n => !n.read).length
)

// 알림창 열기
const openAlarm = async () => {
  drawer.value = false
  isAlarmOpen.value = true
  await notificationStore.fetchNotifications(userStore.token)
}

const closeAlarm = () => {
  isAlarmOpen.value = false
  drawer.value = true
}

const goToHome = () => router.push('/home')

const goToMypage = () => {
  if (userStore.id) {
    router.push(`/mypage/${userStore.id}`)
  } else {
    console.warn('로그인된 사용자 ID가 없습니다.')
  }
}

const goToCreateDiary = () => router.push('/post/create')

const goToStamp = () => {
  if (userStore.id) {
    router.push(`/stamp/${userStore.id}`)
  } else {
    console.warn('로그인된 사용자 ID가 없습니다.')
  }
}

const openUserSearch = () => {
  drawer.value = false
  searchPanelOpen.value = true
}

const handleSearchClose = () => {
  searchPanelOpen.value = false
  setTimeout(() => {
    drawer.value = true
  }, 50)
}

const goToSettings = () => router.push('/settings')
const goToActivities = () => router.push('/activities')
const reportProblem = () => console.log('문제 신고 창 열기')

// 로그아웃
async function confirmLogout() {
  // console.log('logout accessToken:', userStore.token);
  // try {
  //   await axios.post('http://localhost:8080/api/member/logout', null, {
  //     headers: {
  //       Authorization: `Bearer ${userStore.token}`
  //     }
  //   })

  //   userStore.logout()
  //   router.push('/')
  // } catch (err) {
  //   console.error('❌ 로그아웃 실패', err)
  // }
  await userStore.logout();
  router.push('/')
}


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

.badge {
  position: absolute;
  top: 0px;
  right: 2px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
}
</style>
