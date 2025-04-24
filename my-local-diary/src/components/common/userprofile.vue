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

    <!-- 🎵 음악 제목 (버튼 대신 텍스트처럼 보이는 요소) -->
    <p @click="onUnMute" class="music-title mt-4 text-sm">
      🎵 {{ userInfo.musicTitle }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  emits: ['video-id-loaded', 'request-unmute'],
  data() {
    return {
      userInfo: null,
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
        this.$emit('video-id-loaded', data.videoId);
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    },
    onUnMute() {
      this.$emit('request-unmute'); // 부모에게 소리 켜기 요청
    },
  }
};
</script>

<style scoped>
.music-title {
  font-weight: 400;
  color: #4b5563; /* Tailwind의 text-gray-600 */
  transition: color 0.3s ease;
  user-select: none;
}

.music-title:hover {
  color: #374151; /* 약간 더 진한 회색 */
  text-decoration: none;
}

</style>
