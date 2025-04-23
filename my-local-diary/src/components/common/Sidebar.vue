<template>
    <VNavigationDrawer
      v-model="drawer"
      app
      :width="isHover ? 200 : 80"
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
            src="/src/assets/login/cursor_ 10.svg"
            alt="cursor"
            
          ></v-img>
          <v-img
            v-else
            src="/src/assets/logo/My_Local_Diary.png"
            alt="diary"
            width="150"
          ></v-img>
        </v-list-item>
  
        <v-list-item>
  <div class="menu-item">
    <v-img
      src="/src/assets/sidebar/Map.png"
      alt="map"
      class="menu-icon"
    />
    <span v-if="isHover">지도 홈</span>
  </div>
</v-list-item>

<v-list-item @click="goToMypage" class="clickable">
  <div class="menu-item">
    <v-img
      src="/src/assets/sidebar/person.png"
      alt="마이페이지"
      class="menu-icon"
    />
    <span v-if="isHover">마이페이지</span>
  </div>
</v-list-item>

<v-list-item>
  <div class="menu-item">
    <v-img
      src="/src/assets/sidebar/Pen.png"
      alt="pen"
      class="menu-icon"
    />
    <span v-if="isHover">글쓰기</span>
  </div>
</v-list-item>

<v-list-item>
  <div class="menu-item">
    <v-img
      src="/src/assets/sidebar/Search.png"
      alt="search"
      class="menu-icon"
    />
    <span v-if="isHover">검색</span>
  </div>
</v-list-item>

<v-list-item>
  <div class="menu-item">
    <v-img
      src="/src/assets/sidebar/stamp.png"
      alt="stamp"
      class="stamp-icon ml-n1"
    />
    <span v-if="isHover">스탬프 목록</span>
  </div>
</v-list-item>

<v-list-item>
  <div class="menu-item">
    <v-img
      src="/src/assets/sidebar/notifications.png"
      alt="notifications"
      class="menu-icon"
    />
    <span v-if="isHover">알림</span>
  </div>
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
  </style>
  
  
  