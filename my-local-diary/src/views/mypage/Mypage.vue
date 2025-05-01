<template>
  <v-app class="mypage-container">
    <LoadingModal v-if="isLoading" :today="new Date()" message="프로필 불러오는 중..." />

    <v-main v-if="!isLoading">
      <div style="display: flex; height: 100vh;">
        <div
          class="left-side"
          style="flex: 6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); flex-direction: column;"
        >
          <UserProfile
            v-if="profileUserData"
            :userData="profileUserData"
            :isMine="isMine"
            @open-follower="isFollowerModalOpen = true"
            @open-following="isFollowingModalOpen = true"
          />

          <div class="mini-map">
            <router-link to="/user-map-home" class="mini-map-link">지도에서 보기 →</router-link>
            <MiniMap
              :memberId="routeUserId"
              width="100%"
              height="300px"
              @post-selected="(id) => selectedPostId = id"
            />
          </div>
        </div>
        <!-- 게시글 모달 -->
        <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
          <div class="modal-content" @click.stop>
            <div class="d-flex justify-end">
              <button class="pr-3 pl-3" @click="selectedPostId = null">X</button>
            </div>
            <PostCard :postId="selectedPostId" />
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
  import axios from 'axios';

  import MiniMap from '@/components/mypage/MiniMap.vue';
  import UserProfile from '@/components/common/userprofile.vue';
  import TodayDiary from '@/components/mypage/TodayDiary.vue';
  import Temp from '@/components/mypage/Temp.vue';
  import LoadingModal from '@/components/common/LoadingModal.vue'; 
  import PostCard from '@/components/post/PostCard.vue' 


  const userStore = useUserStore();
  const route = useRoute();

  const profileUserData = ref(null);
  const isFollowerModalOpen = ref(false);
  const isFollowingModalOpen = ref(false);
  const isLoading = ref(true); // 로딩 상태
  const selectedPostId = ref(null) // 선택된 게시글 ID


  const routeUserId = computed(() => {
    return route.params.id ? Number(route.params.id) : userStore.id;
  });
  const isMine = computed(() => routeUserId.value === userStore.id);

  const fetchUserProfile = async () => {
    if (isMine.value) {
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
      try {
        const res = await axios.get(`http://localhost:8080/api/member/${routeUserId.value}`, {
          headers: {
            Authorization: `Bearer ${userStore.token}`
          }
        });
        profileUserData.value = res.data.data;
      } catch (err) {
        console.error('❌ 유저 정보 조회 실패:', err);
      }
    }
  };

  onMounted(async () => {
    isLoading.value = true; // ✅ 시작
    await userStore.restoreUser();
    await fetchUserProfile();
    isLoading.value = false; // ✅ 종료
  });

  // 라우터 변경 시에도 리패치
  watch(() => route.params.id, async () => {
    isLoading.value = true;
    await fetchUserProfile();
    isLoading.value = false;
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
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 16px;
  border-radius: 12px;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
}


</style>