<template>
  <v-app class="mypage-container">
    <v-main>
      <div style="display: flex; height: 100vh;">
        <div
          class="left-side"
          style="flex: 6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); flex-direction: column;"
        >
          <UserProfile
            v-if="profileUserData"
            :userData="profileUserData"
            :isMyProfile="isMyProfile"
          />

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
  import { onMounted, ref, computed , watch } from 'vue';
  import { useRoute } from 'vue-router'
  import { useUserStore } from '@/stores/userStore.js';
  import axios from 'axios'

  import MiniMap from '@/components/mypage/MiniMap.vue';
  import UserProfile from '@/components/common/userprofile.vue';
  import TodayDiary from '@/components/mypage/TodayDiary.vue';
  import Temp from '@/components/mypage/Temp.vue';

  const userStore = useUserStore();
  const route = useRoute()

  const profileUserData = ref(null);   // 다른 사람 또는 내 정보
  const routeUserId = computed(() => Number(route.params.id));
  const isMine = computed(() => routeUserId.value === userStore.id);


  // 다른 유저일 경우 백엔드에서 fetch
  const fetchUserProfile = async () => {
    if (isMine.value) {
      console.log("로그인한 유저의 정보 가져오기")

      profileUserData.value = {
        id: userStore.id,
        loginId: userStore.loginId,
        nickname: userStore.nickname,
        email: userStore.email,
        birth: userStore.birth,
        role: userStore.role,
        status: userStore.status,
        isPublic: userStore.isPublic,
        bio: userStore.bio,
        profileImage: userStore.profileImage,
        profileMusic: userStore.profileMusic,
        followers: userStore.followers,
        following: userStore.following,
        posts: userStore.posts
      };
    } else {
     console.log('다른 유의의 정보 가져오기')
      console.log(userStore.token)
      try {
        console.log("🔍 요청 대상 ID:", routeUserId.value);
        console.log("🔍 현재 로그인한 내 ID:", userStore.id)
        console.log("🟡 isMine:", isMine.value)
        const res = await axios.get(`http://localhost:8080/api/member/${routeUserId.value}`, {
          headers: {
            Authorization: `Bearer ${userStore.token}`
          }
        });
        console.log(res.data)
        profileUserData.value = res.data.data;
      } catch (err) {
        console.error('❌ 유저 정보 조회 실패:', err);
      }
    }
  };


  onMounted(async () => {
    await userStore.restoreUser(); // Pinia 상태 복구
    console.log(userStore.token)
    await fetchUserProfile(); // 데이터 로딩
  });

  // 라우터가 바뀌는 경우에도 유저 다시 가져오기
  watch(() => route.params.id, fetchUserProfile);
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