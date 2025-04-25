<template>
  <div class="container">
    <!-- 유저 프로필 -->
    <div class="left-side">
      <UserProfile />
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
</template>

<script>
import CatStampBar from '/src/components/stamp/stamp.vue';
import UserProfile from '/src/components/common/UserProfile.vue';

const BASE_STAMPS = [
  { title: '카페냥', stampImage: '/src/assets/stamp_pic/카페냥.png' },
  { title: '산책냥', stampImage: '/src/assets/stamp_pic/산책냥.png' },
  { title: '꽐라냥', stampImage: '/src/assets/stamp_pic/꽐라냥.png' },
  { title: '독서냥', stampImage: '/src/assets/stamp_pic/독서냥.png' },
  { title: '맛집냥', stampImage: '/src/assets/stamp_pic/맛집냥.png' },
  { title: '영화냥', stampImage: '/src/assets/stamp_pic/영화냥.png' }
];

export default {
  name: 'Stamppage',
  components: { CatStampBar, UserProfile },
  data() {
    return {
      currentPage: 0,
      stampsPerPage: 4,
      stamps: []
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.stamps.length / this.stampsPerPage);
    },
    paginatedStamps() {
      const start = this.currentPage * this.stampsPerPage;
      return this.stamps.slice(start, start + this.stampsPerPage);
    }
  },
  mounted() {
    this.fetchStampCounts();
  },
  methods: {
    async fetchStampCounts() {
      try {
        const res = await fetch('http://localhost:3000/stampCounts');
        const stampCounts = await res.json();
        this.stamps = BASE_STAMPS.map((stamp) => ({
          ...stamp,
          count: stampCounts[stamp.title] ?? 0
        }));
      } catch (err) {
        console.error('❌ 스탬프 count 불러오기 실패:', err);
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) this.currentPage++;
    },
    previousPage() {
      if (this.currentPage > 0) this.currentPage--;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100%;
  margin: 0;
}
.left-side {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 40px;
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
