<template>
  <v-app class="mypage-container">
    <v-main>
      <div style="display: flex; height: 100vh;">
        <div
          class="left-side"
          style="flex: 6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); flex-direction: column;"
        >
          <UserProfile :userData="userStore" />

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
  import UserProfile from '@/components/common/userprofile.vue';
  import { useUserStore } from '@/stores/userStore.js';
  import TodayDiary from '@/components/mypage/TodayDiary.vue';
  import Temp from '@/components/mypage/Temp.vue';
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const currentPage = route.params.id;
  console.log(currentPage)

  

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
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 40px;
  padding-right: 2%;
  box-sizing: border-box;
  overflow-y: auto;
}

.right-side {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 4% 40px 4%;
  gap: 10px;
  box-sizing: border-box;
  justify-content: space-around;
}

.right-upper {
  flex: 3.5; /* 4 + 6 = 10 기준으로 40% */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.right-downer {
  flex: 6.5; /* 4 + 6 = 10 기준으로 60% */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
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