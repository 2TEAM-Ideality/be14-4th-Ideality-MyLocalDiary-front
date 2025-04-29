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

        <!-- 메뉴 항목 -->
        <v-list-item @click="goToHome">
          <div class="menu-item">
            <v-img src="/src/assets/sidebar/Map.png" class="menu-icon" />
            <span v-if="ui.showText">지도 홈</span>
          </div>
        </v-list-item>

        <v-list-item @click="openUserSearch">
          <div class="menu-item">
            <v-img src="/src/assets/sidebar/Search.png" alt="search" class="menu-icon" />
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
            <v-img src="/src/assets/sidebar/Pen.png" alt="pen" class="menu-icon" />
            <span v-if="ui.showText">글쓰기</span>
          </div>
        </v-list-item>

        <v-list-item @click="goToStamp">
          <div class="menu-item">
            <v-img src="/src/assets/sidebar/stamp.png" alt="stamp" class="stamp-icon ml-n1" />
            <span v-if="ui.showText">스탬프 목록</span>
          </div>
        </v-list-item>

        <v-list-item @click="openAlarm">
  <div class="menu-item" style="position: relative;">
    <v-img src="/src/assets/sidebar/notifications.png" alt="notifications" class="menu-icon" />
    <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span> <!-- 🔥 추가 -->
    <span v-if="ui.showText">알림</span>
  </div>
</v-list-item>

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

  <!-- 🔥 알림창 컴포넌트 추가 -->
  <NotificationPopup
    :isOpen="isAlarmOpen"
    :notifications="notificationList"
    @close="closeAlarm"
  />
</template>

<script setup>
import { ref, computed ,onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import NotificationPopup from '@/components/common/NotificationPopup.vue'
import axios from 'axios'

const router = useRouter()
const drawer = ref(true)
const ui = useUIStore()
const showMoreMenu = ref(false)

const isAlarmOpen = ref(false) // 알림창 열리는지 여부
const notificationList = ref([]) // 초기에는 비어있음

const goToHome = () => router.push('/home')
const goToMypage = () => router.push('/mypage')
const goToCreateDiary = () => router.push('/post/create')
const goToStamp = () => router.push('/stamp')
const openUserSearch = () => console.log('유저 검색 창 뜨기')

const unreadCount = computed(() => {
  return notificationList.value.filter(n => !n.isRead).length
})

// 🔥 fetchNotifications 함수 만들기
const fetchNotifications = async () => {
  try {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzQ1ODkzODQ3LCJleHAiOjE3NDU5MzcwNDd9.NFobldMYwGB7Lm6R85hKpF61GsbomgtSNasnTcaikJjw7zhrXLiZ337WRgNYUWMpYv6XM97tB4RytKkMtCvI2Q'; // 여기도 나중에 localStorage로 교체 가능

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
  } catch (error) {
    console.error('알림 불러오기 실패:', error)
  }
}
const openAlarm = async () => {
  drawer.value = false;  // 사이드바 닫기
  isAlarmOpen.value = true; // 알림창 열기

  try {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzQ1ODkzODQ3LCJleHAiOjE3NDU5MzcwNDd9.NFobldMYwGB7Lm6R85hKpF61GsbomgtSNasnTcaikJjw7zhrXLiZ337WRgNYUWMpYv6XM97tB4RytKkMtCvI2Q'; // 🔥 토큰 복붙하기// 🔥 토큰 꺼내기
    const res = await axios.get('http://localhost:8080/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
  } catch (error) {
    console.error('알림 불러오기 실패:', error)
  }
}

const closeAlarm = () => {
  isAlarmOpen.value = false; // 알림창 닫기
  drawer.value = true; // 사이드바 다시 열기
}

const splitContent = (content) => {
  const match = content.match(/(.+?)님(.*)/)
  if (match) {
    return [match[1], `님${match[2]}`]
  }
  return ['알 수 없음', content]
}

const goToSettings = () => router.push('/settings')
const goToActivities = () => router.push('/activities')
const reportProblem = () => console.log('문제 신고 창 열기')
const confirmLogout = () => {
  if (confirm('정말 로그아웃 하시겠습니까?')) {
    console.log('로그아웃 완료')
    router.push('/')
  }
}

onMounted(() => {
  fetchNotifications()
})
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
  right:2px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
}

</style>
