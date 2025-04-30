<template>
  <div v-if="userData" class="user-profile">
    <!-- 프로필 이미지 -->
    <div class="profile-img">
      <img :src="userData.profileImage || '/images/profile/defaultProfile.png'" alt="profile" />
    </div>

    <!-- 텍스트 정보 -->
    <div class="user-info">
      <h1 class="user-name">{{ userData.nickname }}</h1>

      <div class="user-stats">
        <span>게시글 <strong>{{ userData.posts }}</strong>개</span>
        <!-- ✅ 팔로워 클릭하면 open-follower 이벤트 emit -->
        <span @click="$emit('open-follower')" style="cursor: pointer;">
          팔로워 <strong>{{ userData.followers }}</strong>
        </span>

        <!-- ✅ 팔로우 클릭하면 open-following 이벤트 emit -->
        <span @click="$emit('open-following')" style="cursor: pointer;">
          팔로우 <strong>{{ userData.following }}</strong>
        </span>
      </div>

      <p class="user-bio">{{ userData.bio }}</p>

      <div class="music-info" @click="togglePlayback">
        <span>🎵 {{ musicTitle }}</span>
        <span class="time-info">{{ formattedTime }} / {{ formattedDuration }}</span>

        <!-- 🎵 추가: 재생중일 때만 보여주는 로딩 애니메이션 -->
        <l-waveform
          v-if="isPlaying"
          size="18"
          stroke="2.5"
          speed="1"
          color="gray"
          style="margin-left: 8px;"
        />
      </div>

      <!-- 버튼 영역 -->
      <div class="button-group" v-if="isMyProfile">
        <v-btn color=" gray" variant="flat" @click="editProfile">프로필 편집</v-btn>
        <v-btn color=" gray" variant="flat" @click="editAccount">개인 정보 설정</v-btn>
      </div>
      <button v-else class="follow-button" @click="handleFollow">팔로우</button>
    </div>

    <!-- 오디오 플레이어 -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute }from 'vue-router';
import { useUserStore } from '@/stores/userStore'
import { waveform } from 'ldrs'
import axios from 'axios'

waveform.register()  // 배경음악 재생 중 표시 

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

// TODO. isMine 으로 내 프로필 or 남의 프로필 비교 



const props = defineProps({
  userData: Object,
  isMine: Boolean
})

const route = useRoute()
const currentParam = route.params.id;
console.log(currentParam)

const router = useRouter();
const userStore = useUserStore()

// const isMyProfile = computed(() =>  Number(currentParam) === userStore.id)
const isMyProfile = props.isMine;

const audioPlayer = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const formattedTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

const musicTitle = computed(() => {
  if (!props.userData.profileMusic) return ''
  return decodeURIComponent(props.userData.profileMusic.split('/').pop().split('.')[0])
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

// 🚀 컴포넌트 로드될 때 자동 재생 시도
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.play().then(() => {
      isPlaying.value = true
    }).catch((err) => {
      console.warn('🎵 자동 재생 실패 (사용자 조작 필요):', err)
      isPlaying.value = false
    })
  }
})

// 🚀 음악 파일이 변경되었을 때 자동 재생 재시도
watch(() => props.userData.profileMusic, (newMusic) => {
  if (newMusic && audioPlayer.value) {
    audioPlayer.value.load();
    audioPlayer.value.play().then(() => {
      isPlaying.value = true
    }).catch((err) => {
      console.warn('🎵 음악 변경 후 자동 재생 실패:', err)
    })
  }
})

const editProfile = () => {
  console.log("프로필 편집 클릭")
  router.push('/edit/profile');
}
const editAccount = () => {
  console.log("개인 정보 수정 클릭")
  router.push('/edit/account');
}
</script>

<style scoped>
.user-profile {
  width:100%;
  /* max-width: 768px; */
  margin: 15px auto;
  padding: 32px;
  display: flex;
  align-items: flex-start; 
  /* align-items: center; */
  /* background-color: #ffffff; */
  color: #1f2937;
  /* border-radius: 16px; */
  /* border: 1px solid #e5e7eb; */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); */
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

.follow-button {
  padding: 8px 16px;
  font-size: 14px;
  background-color: #1f2937;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.hidden {
  display: none;
}
</style>