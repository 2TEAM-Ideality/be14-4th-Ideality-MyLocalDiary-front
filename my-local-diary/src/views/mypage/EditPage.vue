<template>
  <v-app class="container">
    <div class="wrapper">
      <!-- 왼쪽 인덱스 메뉴 -->
      <div class="index-list">
        <div
          v-for="item in menuItems"
          :key="item.name"
          class="index"
          :class="{ active: $route.path === item.route }"
          @click="navigate(item.route)"
        >
          {{ item.label }}
        </div>
      </div>

      <!-- 오른쪽 메인 콘텐츠 -->
      <v-main class="content">
        <RouterView /> <!-- 🔥 URL에 따라 페이지 컴포넌트 불러옴 -->
      </v-main>
    </div>
  </v-app>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { label: '마이페이지', route: '/mypage' },
  { label: '프로필 편집', route: '/edit/profile' },
  { label: '개인 정보 수정', route: '/edit/account' }
]

// 이동
const navigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  height: 100vh;
}

.index-list {
  padding-top: 2%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 150px;
}

.index {
  background-color: #FF9A9A;
  color: white;
  padding: 10px 10px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.index.active {
  opacity: 1;
}

.content {
  width: 50%;
  max-width: 60%;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  height: fit-content;
  min-height: 100vh;
}
</style>
