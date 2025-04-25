<template>
  <div v-if="userInfo" class="user-profile">
    <!-- 프로필 이미지 -->
    <div class="profile-img">
      <img :src="userInfo.profileImage" alt="profile" />
    </div>

    <!-- 텍스트 정보 -->
    <div class="user-info">
      <!-- 이름 -->
      <h1 class="user-name">{{ userInfo.name }}</h1>

      <!-- 게시글 / 팔로워 / 팔로우 -->
      <div class="user-stats">
        <span>게시글 <strong>{{ userInfo.posts }}</strong>개</span>
        <span>팔로워 <strong>{{ userInfo.followers }}</strong></span>
        <span>팔로우 <strong>{{ userInfo.following }}</strong></span>
      </div>

      <!-- 소개 -->
      <p class="user-bio">{{ userInfo.bio }}</p>

      <!-- 음악 -->
      <div class="music-info" @click="togglePlayback">
        <span>🎵 {{ userInfo.musicTitle }}</span>
        <span class="time-info">{{ formattedTime }} / {{ formattedDuration }}</span>
      </div>

      <!-- 버튼 -->
      <div class="button-group">
        <button>프로필 편집</button>
        <button>개인 정보 설정</button>
      </div>
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
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.user-profile {
  max-width: 768px;
  margin: 40px auto;
  padding: 32px;
  display: flex;
  align-items: center;
  background-color: #ffffff; /* 배경 흰색 */
  color: #1f2937;
  border-radius: 16px;
  border: 1px solid #e5e7eb; /* 연한 회색 테두리 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); /* 가볍고 부드러운 그림자 */
  gap: 32px;
}


.profile-img img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d1d5db;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: bold;
}

.user-stats {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #4b5563;
}

.user-bio {
  font-size: 16px;
  color: #374151;
}

.music-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}

.time-info {
  font-size: 12px;
  color: #9ca3af;
}

.button-group {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.button-group button {
  padding: 8px 16px;
  font-size: 14px;
  background-color: #e5e7eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.hidden {
  display: none;
}
</style>
