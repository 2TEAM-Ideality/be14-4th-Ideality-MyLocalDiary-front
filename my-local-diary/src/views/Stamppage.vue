<template>
  <div class="container">
    <!-- 유저 프로필 -->
    <div class="left-side">
      <UserProfile :userData="userStore" 
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
import { ref, computed, onMounted } from 'vue';
import CatStampBar from '/src/components/stamp/stamp.vue';
import UserProfile from '/src/components/common/UserProfile.vue';
import { useUserStore } from '/src/stores/userStore.js';
import Badge from '/src/components/stamp/badge.vue';
import Follower from '/src/components/follow/Follower.vue';
import Following from '/src/components/follow/Following.vue';

const userStore = useUserStore();

const BASE_STAMPS = [
  { title: '카페냥', stampImage: '/src/assets/stamp_pic/카페냥.png' },
  { title: '산책냥', stampImage: '/src/assets/stamp_pic/산책냥.png' },
  { title: '꽐라냥', stampImage: '/src/assets/stamp_pic/꽐라냥.png' },
  { title: '독서냥', stampImage: '/src/assets/stamp_pic/독서냥.png' },
  { title: '맛집냥', stampImage: '/src/assets/stamp_pic/맛집냥.png' },
  { title: '영화냥', stampImage: '/src/assets/stamp_pic/영화냥.png' }
];

// 상태 관리
const currentPage = ref(0);
const stampsPerPage = 4;
const stamps = ref([]);
const isFollowerModalOpen = ref(false);
const isFollowingModalOpen = ref(false);

const totalPages = computed(() => Math.ceil(stamps.value.length / stampsPerPage));

const paginatedStamps = computed(() => {
  const start = currentPage.value * stampsPerPage;
  return stamps.value.slice(start, start + stampsPerPage);
});

// 데이터 가져오기
const fetchStampCounts = async () => {
  try {
    const res = await fetch('http://localhost:3001/member_stamp');
    const memberStamps = await res.json();

    // 내 id만 필터링
    const myId = Number(userStore.id);
    const myStamps = memberStamps.filter(record => record.member.id === myId);

    // 내 스탬프 기록으로 count 세기
    const stampCountMap = {};

    myStamps.forEach((record) => {
      const stampName = record.stamp.name;
      if (stampCountMap[stampName]) {
        stampCountMap[stampName]++;
      } else {
        stampCountMap[stampName] = 1;
      }
    });

    // BASE_STAMPS 기준으로 갯수 매칭
    stamps.value = BASE_STAMPS.map((stamp) => ({
      ...stamp,
      count: stampCountMap[stamp.title] ?? 0
    }));

  } catch (err) {
    console.error('❌ 스탬프 count 불러오기 실패:', err);
  }
};

// 페이지 네비게이션
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
};

const previousPage = () => {
  if (currentPage.value > 0) currentPage.value--;
};

// 컴포넌트 마운트 시 데이터 로딩
onMounted(async () => {
  await userStore.restoreUser();  // ✅ await 필수
  fetchStampCounts();              // ✅ 그 다음에 데이터 받아와야
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