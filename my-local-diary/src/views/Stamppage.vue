<template>
  <div class="container">
    <!-- 유저 프로필 -->
    <div class="left-side">
      <UserProfile
        :isPlaying="isPlaying"
        :togglePlayback="togglePlayback"
        :musicTitle="musicTitle"
        :currentTime="currentTime"
        :duration="duration"
      />
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

    <!-- 유도 문구 (처음에만 뜨고 클릭 가능) -->
    <div v-if="showPlayGuide && musicUrl && !isPlaying" class="play-guide" @click="handleUserPlayClick">
      🎧 지금 기분을 담은 음악, 한 번 들어볼래요?
    </div>

    <!-- 오디오 -->
    <audio
      ref="audioPlayer"
      :src="musicUrl"
      preload="auto"
      class="hidden"
      @timeupdate="onTimeUpdate"
      @ended="isPlaying = false"
    />
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
      stamps: [],
      musicUrl: '',
      musicTitle: '',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      showPlayGuide: false
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
    this.fetchUserMusic();
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
    async fetchUserMusic() {
      try {
        const res = await fetch('http://localhost:3000/user');
        const data = await res.json();
        this.musicUrl = data.musicUrl || '';
        this.musicTitle = data.musicTitle || '';

        this.$nextTick(() => {
          const player = this.$refs.audioPlayer;
          if (player) {
            // 자동 재생 시도 (실패해도 OK)
            player.play().then(() => {
              this.isPlaying = true;
            }).catch(() => {
              // 실패 시 유도 문구 표시
              this.showPlayGuide = true;
              // 자동 숨기기는 선택 사항 (3초 후 사라짐)
              setTimeout(() => {
                this.showPlayGuide = false;
              }, 4000);
            });
          }
        });
      } catch (err) {
        console.error('❌ 음악 정보 불러오기 실패:', err);
      }
    },
    togglePlayback() {
      const player = this.$refs.audioPlayer;
      if (!player) return;

      if (this.isPlaying) {
        player.pause();
        this.isPlaying = false;
      } else {
        player.play().then(() => {
          this.isPlaying = true;
        }).catch((err) => {
          console.warn('🎵 재생 실패:', err);
        });
      }
    },
    handleUserPlayClick() {
      this.showPlayGuide = false;
      this.togglePlayback(); // 유저 클릭 후 재생
    },
    onTimeUpdate() {
  const player = this.$refs.audioPlayer;
  if (!player) return; // 💥 player가 없으면 아무 것도 하지 않음

  this.currentTime = player.currentTime;
  this.duration = player.duration;
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
  align-items: center; /* ✅ 가로 방향 중앙 정렬 */
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
.hidden {
  display: none;
}

.play-guide {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #222;
  color: #fff;
  padding: 10px 20px;
  border-radius: 16px;
  font-size: 14px;
  z-index: 999;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  animation: fadeInOut 4s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  10% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
}
</style>
