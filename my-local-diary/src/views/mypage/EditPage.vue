<template>
  <v-app class="container">
    <div class="wrapper">
      <!-- 왼쪽 인덱스 메뉴 -->
      <div class="index-list">
        <div
          v-for="item in menuItems"
          :key="item.name"
          class="index"
          :class="{ active: currentPage === item.name }"
          @click="currentPage = item.name"
        >
          {{ item.label }}
        </div>
      </div>

      <!-- 오른쪽 메인 콘텐츠 -->
      <v-main class="content">
        <!-- 🔥 현재 페이지 이름도 넘겨준다 -->
        <component :is="currentComponent" :user="user" :current-page="currentPage" v-if="user" />
      </v-main>
    </div>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

import EditProfile from '@/components/mypage/EditProfile.vue'
import EditAccount from '@/components/mypage/EditAccount.vue'

const menuItems = [
  { label: '프로필 편집', name: 'EditProfile' },
  { label: '개인 정보 수정', name: 'EditAccount' }
]

const currentPage = ref('EditProfile')
const user = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get('/json/logined_user.json')
    user.value = res.data
  } catch (e) {
    console.error('유저 정보 로딩 실패', e)
  }
})

const currentComponent = computed(() => {
  if (currentPage.value === 'EditProfile') return EditProfile
  if (currentPage.value === 'EditAccount') return EditAccount
  return null
})
</script>

  
  


<style scoped>
  .container {
    width: 100%;
    min-height: 100vh;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .index-list {
    padding-top: 2%;
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-width: 180px;
  }
  
  .index {
    background-color: #FF9A9A;
    color: white;
    padding: 10px 20px;
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
    height: 100vh;
    overflow-y: auto;
  }
  </style>
  