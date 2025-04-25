<template>
  <div v-if="userInfo" class="w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white text-gray-900">
    <div class="flex items-center gap-4">
      <img :src="userInfo.profileImage" alt="profile" class="w-20 h-20 rounded-full object-cover border-2 border-black" />
      <div>
        <h1 class="text-2xl font-bold">{{ userInfo.name }}</h1>
        <div class="flex gap-4 mt-1 text-sm text-gray-600">
          <div>게시글 <strong>{{ userInfo.posts }}</strong>개</div>
          <div>팔로워 <strong>{{ userInfo.followers }}</strong></div>
          <div>팔로우 <strong>{{ userInfo.following }}</strong></div>
        </div>
      </div>
    </div>

    <p class="mt-4 text-sm">{{ userInfo.bio }}</p>

    <!-- 🎵 동영상 제목 표시 -->
    <p class="music-title mt-4 text-sm">🎵 {{ videoTitle }}</p>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  data() {
    return {
      userInfo: null,
      videoTitle: ''
    };
  },
  mounted() {
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await fetch('http://localhost:3000/user');
        const data = await response.json();
        this.userInfo = data;

        // YouTube URL에서 videoId 추출
        const match = data.youtubeUrl?.match(/v=([a-zA-Z0-9_-]+)/);
        const videoId = match ? match[1] : null;

        if (videoId) {
          this.$emit('video-id-loaded', videoId);
          this.fetchVideoTitle(videoId);
        }
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    },
    async fetchVideoTitle(videoId) {
      const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
        );
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          this.videoTitle = data.items[0].snippet.title;
        } else {
          this.videoTitle = '제목을 가져올 수 없습니다.';
        }
      } catch (error) {
        console.error('동영상 제목을 가져오는 데 실패했습니다:', error);
        this.videoTitle = '제목을 가져올 수 없습니다.';
      }
    }
  }
};
</script>

<style scoped>
.music-title {
  font-weight: 400;
  color: #4b5563;
  transition: color 0.3s ease;
  user-select: none;
}
.music-title:hover {
  color: #374151;
}
</style>
