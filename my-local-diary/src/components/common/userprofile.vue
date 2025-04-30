<template>
  <div v-if="userData" class="user-profile">
    <!-- 프로필 이미지 -->
    <div class="profile-img">
      <img :src="userData.profileImage || '/images/profile/defaultProfile.png'" alt="profile" />
    </div>

    <!-- 유저 정보 -->
    <div class="user-info">
        <div class="follow-wrapper">
          <h1 class="user-name">{{ userData.nickname }}</h1>
          <!-- 다른 유저 프로필일 경우 -->
          <div class="follow-wrapper" v-if="!isMyProfile">
            <button class="follow-button" @click="handleFollow">팔로우</button>
          </div>
        </div>
        <div class="user-stats">
          <span>게시글 <strong>{{ userData.posts }}</strong>개</span>
          <span @click="$emit('open-follower')" style="cursor: pointer;">
            팔로워 <strong>{{ userData.followers }}</strong>
          </span>
          <span @click="$emit('open-following')" style="cursor: pointer;">
            팔로우 <strong>{{ userData.following }}</strong>
          </span>
        </div>
        
 
        
       

      <p class="user-bio">{{ userData.bio }}</p>

      <!-- 프로필 음악 -->
      <div class="music-info" @click="togglePlayback">
        <span>🎵 {{ musicTitle }}</span>
        <span class="time-info">{{ formattedTime }} / {{ formattedDuration }}</span>
        <l-waveform v-if="isPlaying" size="18" stroke="2.5" speed="1" color="gray" style="margin-left: 8px;" />
      </div>

      <!-- 내 프로필일 경우 -->
      <div class="button-group" v-if="isMyProfile">
        <v-btn color="gray" variant="flat" @click="editProfile">프로필 편집</v-btn>
        <v-btn color="gray" variant="flat" @click="editAccount">개인 정보 설정</v-btn>
      </div>

      
    </div>

    <audio
      ref="audioPlayer"
      :src="userData.profileMusic"
      preload="auto"
      class="hidden"
      @timeupdate="onTimeUpdate"
      @ended="isPlaying = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { waveform } from 'ldrs'
import axios from 'axios'

// Props
const props = defineProps({
  userData: Object,
  isMine: Boolean
})

// Store & Router
const userStore = useUserStore()
const router = useRouter()

// 음악 재생 관련
const audioPlayer = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const formattedTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

const musicTitle = computed(() => {
  const path = props.userData?.profileMusic?.split('/')?.pop()?.split('.')[0]
  return path ? decodeURIComponent(path) : ''
})

// 본인 프로필인지 여부
const isMyProfile = computed(() => props.isMine)

// LDRS 로딩 이펙트 등록
waveform.register()

// 🎵 음악 재생/일시정지
function togglePlayback() {
  if (!audioPlayer.value) return
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play().then(() => isPlaying.value = true)
      .catch(err => {
        console.warn('🎵 재생 실패:', err)
        isPlaying.value = false
      })
  }
}

// 음악 시간 업데이트
function onTimeUpdate() {
  currentTime.value = audioPlayer.value?.currentTime || 0
  duration.value = audioPlayer.value?.duration || 0
}

// 시간 포맷
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

// 음악 자동 재생
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.play().then(() => isPlaying.value = true)
      .catch(err => {
        console.warn('🎵 자동 재생 실패:', err)
        isPlaying.value = false
      })
  }
})

// 음악이 바뀌면 재생 재시도
watch(() => props.userData.profileMusic, (newVal) => {
  if (newVal && audioPlayer.value) {
    audioPlayer.value.load()
    audioPlayer.value.play().then(() => isPlaying.value = true)
      .catch(err => {
        console.warn('🎵 음악 변경 후 재생 실패:', err)
      })
  }
})


// 프로필 수정 이동
const editProfile = () => router.push('/edit/profile')
const editAccount = () => router.push('/edit/account')

// 팔로우 처리
const handleFollow = async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    alert('로그인이 필요합니다.')
    return
  }

  try {
    await axios.post('http://localhost:8080/api/follow', null, {
      params: {
        fromMemberId: userStore.id,
        toMemberId: props.userData.id,
        fromMemberName: userStore.nickname
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    alert('팔로우 성공!')
  } catch (error) {
    console.error('팔로우 실패:', error)
    alert('팔로우 실패!')
  }
}
</script>

<style scoped>
.user-profile {
  width: 100%;
  margin: 15px auto;
  padding: 32px;
  display: flex;
  align-items: flex-start;
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
  padding: 2px 8px;
  font-size: 14px;
  background-color: #e5e7eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.follow-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
}

.follow-button {
  padding: 2px 8px;
  font-size: 14px;
  background-color: #1f2937;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: fit-content;
  height:fit-content;
}

.hidden {
  display: none;
}
</style>