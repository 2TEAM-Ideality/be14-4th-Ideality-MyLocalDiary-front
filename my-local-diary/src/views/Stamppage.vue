<template>
  <div class="container">
    <!-- 왼쪽 유저 프로필 -->
    <div class="left-side">
      <UserProfile @video-id-loaded="setVideoId" />
    </div>

    <!-- 오른쪽 스탬프 영역 -->
    <div class="right-side">
      <div class="stamps">
        <CatStampBar
          v-for="(stamp, index) in paginatedStamps"
          :key="index"
          :title="stamp.title"
          :stampImage="stamp.stampImage"
          :count="stamp.count"
        />

        <!-- 페이지 버튼 -->
        <div class="button-row">
          <button v-if="currentPage > 0" @click="previousPage" class="prev-button">이전장으로</button>
          <button v-if="currentPage < totalPages - 1" @click="nextPage" class="next-button">다음장으로 넘기기</button>
        </div>
      </div>
    </div>

    <!-- 안내 -->
    <div v-if="showAudioNotice" class="audio-notice">
      🎧 음악이 자동 재생 중입니다. 브라우저 설정에 따라 소리가 들리지 않을 수 있어요.
    </div>

    <!-- 유튜브 플레이어 -->
    <div id="player" class="hidden-player"></div>
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
  { title: '영화냥', stampImage: '/src/assets/stamp_pic/영화냥.png' },
];

export default {
  name: 'Stamppage',
  components: { CatStampBar, UserProfile },
  data() {
    return {
      currentPage: 0,
      stampsPerPage: 4,
      videoId: '',
      player: null,
      ytReady: false,
      showAudioNotice: true,
      stamps: [],
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
    this.setupYouTube();
    this.fetchStampCounts();

    this.$nextTick(() => {
      setTimeout(() => {
        this.tryUnMuteViaRouting();
      }, 500);
    });
  },
  methods: {
    async fetchStampCounts() {
      try {
        const res = await fetch('http://localhost:3000/stampCounts');
        const stampCounts = await res.json();

        this.stamps = BASE_STAMPS.map((stamp) => ({
          ...stamp,
          count: stampCounts[stamp.title] ?? 0,
        }));
      } catch (err) {
        console.error('❌ 스탬프 count 불러오기 실패:', err);
      }
    },

    setVideoId(id) {
      this.videoId = id;
      this.tryInitPlayer(); // ▶ 무조건 시도
    },

    setupYouTube() {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        this.ytReady = true;
      }

      window.onYouTubeIframeAPIReady = () => {
        this.ytReady = true;
        this.tryInitPlayer(); // ▶ 무조건 시도
      };
    },

    tryInitPlayer() {
      if (this.videoId && this.ytReady) {
        this.initPlayer();
      }
    },

    initPlayer() {
      if (!this.videoId) return;
      if (this.player && this.player.destroy) this.player.destroy();

      this.player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: this.videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            event.target.setVolume(50);
          }
        }
      });
    },

    tryUnMuteViaRouting() {
      if (this.player && this.ytReady) {
        try {
          this.player.unMute();
          this.showAudioNotice = false;
          console.log('🎯 자동 unMute 성공');
        } catch (e) {
          console.warn('❌ 자동 unMute 실패');
        }
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
  max-width: 100%;
  margin: 0;
}

.left-side {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 40px;
  box-sizing: border-box;
}

.right-side {
  width: 50%;
  background-color: #fff5f7;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stamps {
  justify-content: center;
  align-items: center;
  width: 100%;
  display: flex;
  flex-direction: column;
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

.prev-button {
  margin-right: 10px;
}

.hidden-player {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.audio-notice {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 999;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
</style>
