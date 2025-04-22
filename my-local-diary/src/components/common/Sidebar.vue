<template>
    <VNavigationDrawer
      v-model="drawer"
      app
      :width="isHover ? 200 : 60"
      permanent
      class="pa-2"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <v-list nav dense>
        <!-- 홈 아이콘만 이미지 전환 -->
        <v-list-item>
          <v-img
            v-if="!isHover"
            src="@/assets/cursor_ 10.svg"
            alt="cursor"
            width="36"
            class="ml-n2"
          ></v-img>
          <v-img
            v-else
            src="@/assets/My_Local_Diary.png"
            alt="diary"
            width="150"
          ></v-img>
        </v-list-item>
  
        <v-list-item>
          <v-img src="@/assets/Map.png" alt="map" width="24" class="mr-2" />
          <span v-if="isHover">지도 홈</span>
        </v-list-item>
  
        <v-list-item @click="goToMypage" class="clickable">
          <v-img src="@/assets/person.png" alt="마이페이지" width="36" class="mr-2" />
          <span v-if="isHover">마이페이지</span>
        </v-list-item>
  
        <v-list-item>
          <v-img src="@/assets/Pen.png" alt="pen" width="24" class="mr-2" />
          <span v-if="isHover">글쓰기</span>
        </v-list-item>
  
        <v-list-item>
          <v-img src="@/assets/Search.png" alt="search" width="24" class="mr-2" />
          <span v-if="isHover">검색</span>
        </v-list-item>
  
        <v-list-item>
          <v-img src="@/assets/stamp.png" alt="stamp" width="36" class="mr-2 ml-n1" />
          <span v-if="isHover">스탬프 목록</span>
        </v-list-item>
  
        <v-list-item>
          <v-img src="@/assets/notifications.png" alt="notifications" width="24" class="mr-2" />
          <span v-if="isHover">알림</span>
        </v-list-item>
      </v-list>
    </VNavigationDrawer>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const isHover = ref(false)
  const drawer = ref(true)
  const router = useRouter()
  
  const goToMypage = () => {
    router.push('/mypage')
  }
  </script>
  
  <style scoped>
  .clickable {
    cursor: pointer;
  }
  </style>
  
  
  