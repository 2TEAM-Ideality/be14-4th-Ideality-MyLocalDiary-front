<template>
  <VNavigationDrawer
    v-model="drawer"
    app
    :width="isHover ? 200 : 80"
    permanent
    class="pa-2"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <v-list nav dense>
      <!-- 붕어빵은 즉시 사라지고, 로고는 딜레이 후 표시 -->
      <v-list-item>
        <div class="logo-container">
          <v-img
            v-if="!isHover"
            src="/src/assets/cursor/슈크림붕어빵1.png"
            alt="cursor"
            width="40"
          />
          <transition name="fade">
            <v-img
              v-if="showImage"
              src="/src/assets/logo/My_Local_Diary.png"
              alt="diary"
            />
          </transition>
        </div>
      </v-list-item>

      <!-- 메뉴 항목 -->
      <v-list-item  @click="goToHome">
        <div class="menu-item">
          <v-img src="/src/assets/sidebar/Map.png" alt="map" class="menu-icon" />
          <span v-if="showText">지도 홈</span>
        </div>
      </v-list-item>

      <v-list-item @click="goToMypage" class="clickable">
        <div class="menu-item">
          <v-img src="/src/assets/sidebar/person.png" alt="mypage" class="menu-icon" />
          <span v-if="showText">마이페이지</span>
        </div>
      </v-list-item>

      <v-list-item  @click="goToPostCreate">
        <div class="menu-item">
          <v-img src="/src/assets/sidebar/Pen.png" alt="pen" class="menu-icon" />
          <span v-if="showText">글쓰기</span>
        </div>
      </v-list-item>

      <v-list-item  @click="openUserSearch">
        <div class="menu-item">
          <v-img src="/src/assets/sidebar/Search.png" alt="search" class="menu-icon" />
          <span v-if="showText">검색</span>
        </div>
      </v-list-item>

      <v-list-item  @click="goToStamp">
        <div class="menu-item">
          <v-img src="/src/assets/sidebar/stamp.png" alt="stamp" class="stamp-icon ml-n1" />
          <span v-if="showText">스탬프 목록</span>
        </div>
      </v-list-item>

      <v-list-item  @click="openAlarm">
        <div class="menu-item">
          <v-img src="/src/assets/sidebar/notifications.png" alt="notifications" class="menu-icon" />
          <span v-if="showText">알림</span>
        </div>
      </v-list-item>
    </v-list>
  </VNavigationDrawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isHover = ref(false)
const showText = ref(false)
const showImage = ref(false)
const drawer = ref(true)
const router = useRouter()

const handleMouseEnter = () => {
  isHover.value = true
  setTimeout(() => {
    showText.value = true
    showImage.value = true
  }, 250) // 딜레이 후 로고 표시
}

const handleMouseLeave = () => {
  isHover.value = false
  showText.value = false
  showImage.value = false
}

const goToHome = () => {
  router.push('/home')
}
const goToMypage = () => {
  router.push('/mypage')
}
const goToPostCreate = () => {
  router.push('/post/create')
}
const goToStamp = () => {
  router.push('/stamp')
}
const openUserSearch = () => {
  console.log("유저 검색 창 뜨기")
}
const openAlarm = () => {
  console.log("알림 창 뜨기")
}
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

/* 페이드 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
