<template>
  <div
    v-if="userInfo"
    class="w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white text-gray-900"
  >
    <!-- 프로필 -->
    <div class="flex items-center gap-4">
      <img
        :src="userInfo.profileImage"
        alt="profile"
        class="w-20 h-20 rounded-full object-cover border-2 border-black"
      />
      <div>
        <h1 class="text-2xl font-bold">{{ userInfo.name }}</h1>
        <div class="flex gap-4 mt-1 text-sm text-gray-600">
          <div>게시글 <strong>{{ userInfo.posts }}</strong>개</div>
          <div>팔로워 <strong>{{ userInfo.followers }}</strong></div>
          <div>팔로우 <strong>{{ userInfo.following }}</strong></div>
        </div>
      </div>
    </div>

    <!-- 소개 -->
    <p class="mt-4 text-sm">{{ userInfo.bio }}</p>

    <!-- 🎵 제목 + 시간 -->
    <div
      class="music-row mt-4 text-sm flex items-center justify-between cursor-pointer"
      @click="togglePlayback"
    >
      <span class="truncate hover:underline flex-1">
        🎵 {{ userInfo.musicTitle }}
      </span>
      <span class="text-xs text-gray-500 text-right min-w-[72px] pl-3 text-nowrap">
        {{ formattedTime }} / {{ formattedDuration }}
      </span>
    </div>

    <!-- 진행바 -->
    <div class="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
      <div
        class="h-2 bg-pink-400 transition-all duration-300"
        :style="{ width: progress + '%' }"
      />
    </div>

    <!-- 오디오 -->
    <audio
      ref="audioPlayer"
      :src="userInfo.musicUrl"
      preload="auto"
      class="hidden"
      @timeupdate="onTimeUpdate"
      @ended="isPlaying = false"
    />
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  data() {
    return {
      userInfo: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0
    };
  },
  mounted() {
    this.fetchUserInfo();
  },
  computed: {
    progress() {
      return this.duration ? (this.currentTime / this.duration) * 100 : 0;
    },
    formattedTime() {
      return this.formatTime(this.currentTime);
    },
    formattedDuration() {
      return this.formatTime(this.duration);
    }
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await fetch('http://localhost:3000/user');
        const data = await response.json();
        this.userInfo = data;

        // 음악 자동 재생 시도
        this.$nextTick(() => {
          const player = this.$refs.audioPlayer;
          if (player) {
            player.play().then(() => {
              this.isPlaying = true;
            }).catch(() => {
              console.warn('🔇 자동 재생 차단됨');
            });
          }
        });
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
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
    onTimeUpdate() {
      const player = this.$refs.audioPlayer;
      if (!player) return;
      this.currentTime = player.currentTime;
      this.duration = player.duration;
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      return `${min.toString().padStart(2, '0')}:${sec
        .toString()
        .padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.music-row {
  color: #4b5563;
  user-select: none;
  transition: color 0.3s ease;
}
.music-row:hover {
  color: #374151;
}
.hidden {
  display: none;
}
</style>
