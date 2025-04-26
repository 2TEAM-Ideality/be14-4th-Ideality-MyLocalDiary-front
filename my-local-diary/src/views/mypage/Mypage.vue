<template>
  <v-app class="mypage-container">
    <v-main>
      <div style="display: flex; height: 100vh;">
        <div
          class="d-flex align-center justify-center left-side"
          style="flex: 5.6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); flex-direction: column;"
        >
          <UserProfile  :userData="userStore" />

          
          <div class="mini-map">
            <router-link to="/user-map-home" class="mini-map-link">지도에서 보기 →</router-link>
            <MiniMap/>
          </div>
        </div>
       
       
        <div style="flex: 4.4; display: flex; justify-content: center; align-items: center;">
          <div class="stamp-container">
            <div class="stamp">스탬프</div>
            <div class="stamp">스탬프</div>
          </div>
          <div>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>


<script setup>
import MiniMap from '@/components/mypage/MiniMap.vue';
import UserProfile from '@/components/common/UserProfile.vue';
import { useUserStore } from '/src/stores/userStore.js';

const userStore = useUserStore();


</script>

<style scoped>
.mypage-container {
  margin-left: 200px;
}

.left-side {
  /* width: 50%; */
  width:100%;
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 40px;
}
.mini-map-link {
  color: black;
  text-decoration: none;
  width: 100%;
  justify-content: flex-start;
  padding-bottom: 10px;
}
.mini-map {
  margin: 0 auto;
  width: 80%;
  height: 100%;
  display:flex;
  flex-direction: column;
}
.stamp {
  width: 230px;
  height: 300px;
  background-color: pink;
  border-radius: 15px;
}
.stamp-container {
  display:flex; 
  flex-direction: row;
  gap: 15px;
}
</style>