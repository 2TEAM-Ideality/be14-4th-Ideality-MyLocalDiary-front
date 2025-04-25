<template>
  <div v-if="userStore.isLoggedIn" class="user-profile">
    <!-- 프로필 이미지 -->
    <div class="profile-img">
      <img :src="userStore.profileImage || '/images/default-profile.png'" alt="profile" />
    </div>

    <!-- 텍스트 정보 -->
    <div class="user-info">
      <h1 class="user-name">{{ userStore.nickname }}</h1>

      <div class="user-stats">
        <span>게시글 <strong>{{ userStore.posts }}</strong>개</span>
        <span>팔로워 <strong>{{ userStore.followers }}</strong></span>
        <span>팔로우 <strong>{{ userStore.following }}</strong></span>
      </div>

      <p class="user-bio">{{ userStore.bio }}</p>

      <div class="music-info" @click="togglePlayback">
        <span>🎵 {{ musicTitle }}</span>
        <span class="time-info">{{ formattedTime }} / {{ formattedDuration }}</span>
      </div>

      <div class="button-group">
        <button>프로필 편집</button>
        <button>개인 정보 설정</button>
      </div>
    </div>

    <!-- 오디오 -->
    <audio
      ref="audioPlayer"
      :src="userStore.profileMusic"
      preload="auto"
      class="hidden"
      @timeupdate="onTimeUpdate"
      @ended="isPlaying = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'UserProfile',
  setup() {
    const userStore = useUserStore()
    const audioPlayer = ref(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)

    const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
    const formattedTime = computed(() => formatTime(currentTime.value))
    const formattedDuration = computed(() => formatTime(duration.value))

    const musicTitle = computed(() => {
      if (!userStore.profileMusic) return ''
      return decodeURIComponent(userStore.profileMusic.split('/').pop().split('.')[0])
    })

    function togglePlayback() {
      if (!audioPlayer.value) return

      if (isPlaying.value) {
        audioPlayer.value.pause()
        isPlaying.value = false
      } else {
        audioPlayer.value.play().then(() => {
          isPlaying.value = true
        }).catch((err) => {
          console.warn('🎵 재생 실패:', err)
        })
      }
    }

    function onTimeUpdate() {
      if (!audioPlayer.value) return
      currentTime.value = audioPlayer.value.currentTime
      duration.value = audioPlayer.value.duration
    }

    function formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00'
      const min = Math.floor(seconds / 60)
      const sec = Math.floor(seconds % 60)
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    onMounted(() => {
  userStore.restoreUser()

  if (audioPlayer.value) {
    audioPlayer.value.play()
      .then(() => {
        isPlaying.value = true
      })
      .catch((err) => {
        console.warn('🎵 자동 재생 실패 (User Gesture 없음):', err)
        // 유저가 아직 터치 안했으면 여기는 그냥 실패하는 게 정상!
      })
  }
})


    return {
      userStore,
      audioPlayer,
      isPlaying,
      progress,
      formattedTime,
      formattedDuration,
      togglePlayback,
      onTimeUpdate,
      musicTitle
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 768px;
  margin: 40px auto;
  padding: 32px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  color: #1f2937;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
