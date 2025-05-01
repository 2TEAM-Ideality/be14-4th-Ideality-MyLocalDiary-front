<template>
  <LoadingModal v-if="isLoading" :today="new Date()" message="프로필 불러오는 중..." />
  
  <div v-if="!isLoading" class="container">
    <!-- 유저 프로필 -->
    <div class="left-side">
      <UserProfile 
        v-if="profileUserData"
        :userData="profileUserData"
        :isMine="isMine"
        @open-follower="isFollowerModalOpen = true"
        @open-following="isFollowingModalOpen = true"
      />
      <Badge />
    </div>
    

    <!-- 스탬프 영역 -->
    <div class="right-side">
      <div class="stamps">
        <CatStampBar
          v-for="(stamp, index) in paginatedStamps"
          :key="index"
          :title="stamp.title"
          :stampImage="stamp.stampImage"
          :count="stamp.count"
        />
        <div class="button-row">
          <button v-if="currentPage > 0" @click="previousPage" class="prev-button">이전장으로</button>
          <button v-if="currentPage < totalPages - 1" @click="nextPage" class="next-button">다음장으로 넘기기</button>
        </div>
      </div>
    </div>
  </div>

  <Follower
    v-if="isFollowerModalOpen"
    @close="isFollowerModalOpen = false"
  />

  <Following
    v-if="isFollowingModalOpen"
    @close="isFollowingModalOpen = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/userStore.js';
import { useRoute } from 'vue-router'
import axios from 'axios';
import CatStampBar from '@/components/stamp/stamp.vue';
import UserProfile from '@/components/common/userprofile.vue';
import Badge from '@/components/stamp/badge.vue';
import LoadingModal from '@/components/common/LoadingModal.vue';

const userStore = useUserStore();
const route = useRoute();

const profileUserData = ref(null);
const currentPage = ref(0);
const stamps = ref([]);
const isFollowerModalOpen = ref(false);
const isFollowingModalOpen = ref(false);
const isLoading = ref(true);

const stampsPerPage = 4;
const BASE_STAMPS = [
  { title: '카페냥', stampImage: '/src/assets/stamp_pic/카페냥.png' },
  { title: '산책냥', stampImage: '/src/assets/stamp_pic/산책냥.png' },
  { title: '꽐라냥', stampImage: '/src/assets/stamp_pic/꽐라냥.png' },
  { title: '독서냥', stampImage: '/src/assets/stamp_pic/독서냥.png' },
  { title: '맛집냥', stampImage: '/src/assets/stamp_pic/맛집냥.png' },
  { title: '영화냥', stampImage: '/src/assets/stamp_pic/영화냥.png' }
];

// 현재 URL 유저 ID
const routeUserId = computed(() => Number(route.params.id));
const isMine = computed(() => userStore.id && routeUserId.value === Number(userStore.id));
const totalPages = computed(() => Math.ceil(stamps.value.length / stampsPerPage));
const paginatedStamps = computed(() => {
  const start = currentPage.value * stampsPerPage;
  return stamps.value.slice(start, start + stampsPerPage);
});

// 유저 프로필 가져오기
const fetchUserProfile = async () => {
  if (!userStore.id) {
    console.warn("❌ 아직 restoreUser() 끝나지 않음");
    return;
  }

  try {
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
      const res = await axios.get(`http://localhost:8080/api/member/${routeUserId.value}`, {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      });
      profileUserData.value = res.data.data;
    }
  } catch (err) {
    console.error('❌ 유저 정보 조회 실패:', err);
  }
};

// 스탬프 카운트 가져오기
const fetchStampCounts = async () => {
  if (!userStore.id) return;

  try {
    const pageMemberId = Number(userStore.id);
    const res = await fetch(`http://localhost:8080/api/stamp?memberId=${pageMemberId}`);
    const memberStamps = await res.json();

    // BASE_STAMPS 기준으로 갯수 매칭
    stamps.value = BASE_STAMPS.map((stamp) => ({
      ...stamp,
      count: memberStamps[stamp.title] ?? 0
    }));
  } catch (err) {
    console.error('❌ 스탬프 count 불러오기 실패:', err);
  }
};

// 페이지 전환
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
};
const previousPage = () => {
  if (currentPage.value > 0) currentPage.value--;
};

// 최초 로딩
onMounted(async () => {
  isLoading.value = true; // ✅ 로딩 시작
  await userStore.restoreUser();
  await fetchUserProfile();
  isLoading.value = false; // ✅ 로딩 끝

  await fetchStampCounts();
});

watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    isLoading.value = true;
    await fetchUserProfile();
    await fetchStampCounts();
    isLoading.value = false;
  }
});
</script>


<style scoped>
/* 화면 기본 여백 없애기 */
:global(body) {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  min-width: 100vw;
  margin: 0;
}

.left-side {
  width: 50%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  padding-top: 0;
  margin-top: 0;
  position: relative;
  top: -20px;
  align-self: flex-start;
  margin-left: 100px;
}

.right-side {
  width: 50%;
  background-color: #fff5f7;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stamps {
  padding-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex-grow: 1;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: auto;
}

.next-button,
.prev-button {
  background-color: #ff88a0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}
</style>