<template>
  <v-app class="mypage-container">
    <v-main>
      <div style="display: flex; height: 100vh;">
        <div
          class="left-side"
          style="flex: 6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); flex-direction: column;"
        >
          <UserProfile  :userData="userStore" />

          <div class="mini-map">
            <router-link to="/user-map-home" class="mini-map-link">지도에서 보기 →</router-link>
            <MiniMap/>
          </div>
        </div>
       
       
        <div class="right-side">
          <div class="right-upper">
            <!-- <div class="stamp-container">
              <img src="@/assets/badge/꽐라냥뱃지.png" alt="Badge" class="badge-image" />
            </div> -->
            <div class="today-post">
              <TodayDiary />
            </div>
          </div>
          <div class="right-downer">
            <Temp/>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>


<script setup>
  import { onMounted, ref } from 'vue';
  import MiniMap from '@/components/mypage/MiniMap.vue';
  import UserProfile from '@/components/common/UserProfile.vue';
  import { useUserStore } from '/src/stores/userStore.js';
  import TodayDiary from '@/components/mypage/TodayDiary.vue';
  import Temp from '@/components/mypage/Temp.vue';

  const userStore = useUserStore();


  onMounted(async () => {
    await userStore.restoreUser();
  });

</script>

<style scoped>
.mypage-container {
  margin-left: 200px;
  height: 100vh;
  display: flex; 
  flex-direction: column; 
}

.left-side {
  width:50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 40px;
  padding-right: 2%;
  flex-direction: column; /* ✨ 추가 */
  overflow-y: auto; /* ✨ 추가: 넘치면 내부만 스크롤 */
}
.right-side {
  display: flex;
  width: 50%;
  padding: 4%;
  height: 100%;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 40px;
}
.right-upper {
  display: flex;
  flex-direction: row;
  height: 40%;
  padding-top: 50px;
  align-items: stretch; 
  padding-bottom: 10px;
  flex: 0 0 auto;
}
.right-downer{
  padding-top: 10px;
}

.stamp-container {
  display: flex;
  flex-direction: row;
  /* gap: 15px; */
  flex: 0 0 auto; 
}

.today-post {
  width: 100%;
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
  width: 100%;
  height: 100%;
  padding: 0 30px;
  display:flex;
  flex-direction: column;
}


</style>