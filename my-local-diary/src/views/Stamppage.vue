<template>
  <div class="container">
    <!-- 유저 프로필 -->
    <div class="left-side">
      <UserProfile @video-id-loaded="playVideoFromId" />
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

    <!-- 안내 문구 (하단 고정) -->
    <div v-if="showPlayGuide" class="play-guide" @click="guideClicked">
      🎧 지금 기분을 담은 음악, 한 번 들어볼래요?
    </div>

    <!-- 유튜브 플레이어 (숨김) -->
    <div id="yt-player" class="hidden-player"></div>
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
      player: null,
      ytReady: false,
      showPlayGuide: true,
      lastVideoId: null,
      waitingToPlay: false
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
    this.loadYTScript();

    setTimeout(() => {
      this.showPlayGuide = false;
    }, 4000);
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
    loadYTScript() {
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

        // videoId와 클릭이 이미 있었다면 자동 재생
        if (this.waitingToPlay && this.lastVideoId) {
          this.waitingToPlay = false;
          this.showPlayGuide = false;
          this.playVideoFromId(this.lastVideoId);
        }
      };
    },
    playVideoFromId(videoId) {
      this.lastVideoId = videoId;

      if (this.waitingToPlay && this.ytReady) {
        this.waitingToPlay = false;
        this.showPlayGuide = false;
      }

      if (!this.ytReady) return;

      if (this.player) {
        this.player.loadVideoById(videoId);
        this.player.playVideo();
      } else {
        this.player = new YT.Player('yt-player', {
          height: '0',
          width: '0',
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0
          },
          events: {
            onReady: (event) => event.target.playVideo()
          }
        });
      }
    },
    guideClicked() {
      this.waitingToPlay = true;
      this.showPlayGuide = false;

      if (this.lastVideoId && this.ytReady) {
        this.waitingToPlay = false;
        this.playVideoFromId(this.lastVideoId);
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
  animation: fadeInOut 4s ease-in-out forwards;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
}
</style>
