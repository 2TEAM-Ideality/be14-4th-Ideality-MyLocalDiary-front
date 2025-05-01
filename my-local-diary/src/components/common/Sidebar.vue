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
    :notifications="notificationList"
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
import axios from 'axios'

import SearchUserModal from '../search/SearchUserModal.vue'

const router = useRouter()

const ui = useUIStore()
const userStore = useUserStore()
console.log(userStore.$id)
console.log(userStore.token)
const drawer = ref(true)
const showMoreMenu = ref(false)
const searchPanelOpen = ref(false)

const isAlarmOpen = ref(false)
const notificationStore = useNotificationStore()

const isAdmin = ref(userStore.isAdmin)  // 관리자 테스트용


onMounted(async () => {
  // await userStore.restoreUser()
  isAdmin.value = userStore.role === 'ADMIN'
  await notificationStore.fetchNotifications(userStore.token) 
})

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

const handleSearchClose = () => {
  console.log('🔴 SearchUserModal 닫힘');
  searchPanelOpen.value = false;

  // 약간의 지연을 줘야 렌더 타이밍 문제 피할 수 있음
  setTimeout(() => {
    drawer.value = true;
    console.log('✅ drawer 다시 열림');
  }, 50);
}


const unreadCount = computed(() =>
  notificationStore.notifications.filter(n => !n.read).length
)


const fetchNotifications = async () => {
  try {
    const token = userStore.token      
    const res = await axios.get('http://localhost:8080/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })

    notificationList.value = res.data.map(noti => {
      const [nickname, action] = splitContent(noti.content)
      return {
        id: noti.id,
        nickname,
        action,
        createdAt: noti.createdAt,
        isRead: noti.isRead,
        targetId: noti.targetId
      }
    })
    console.log('알람읽어옴');
  } catch (error) {
    console.error('알림 불러오기 실패:', error)
  }
}

const openAlarm = async () => {
  drawer.value = false
  isAlarmOpen.value = true
  await fetchNotifications()
}

const closeAlarm = () => {
  isAlarmOpen.value = false
  drawer.value = true
}

const splitContent = (content) => {
  const match = content.match(/(.+?)님(.*)/)
  return match ? [match[1], `님${match[2]}`] : ['알 수 없음', content]
}

const openUserSearch = () => {
  drawer.value = false // 사이드바 닫기
  searchPanelOpen.value = true
}

const goToSettings = () => router.push('/settings')
const goToActivities = () => router.push('/activities')
const reportProblem = () => console.log('문제 신고 창 열기')

// 로그아웃
async function confirmLogout() {
  // if (!accessToken) {
  //   console.warn('⚠️ 토큰 없음 → 바로 로그아웃');
  //   userStore.logout();
  //   router.push('/');
  //   return;
  // }
  console.log('logout accessToken:', userStore.token);
  try {
    await axios.post('http://localhost:8080/api/member/logout', null, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });

    userStore.logout(); // 상태 초기화
    router.push('/');
  } catch (err) {
    console.error('❌ 로그아웃 실패', err);
  }
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
