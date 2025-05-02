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

        <!-- 다른 유저 프로필일 경우에만 팔로우 버튼 -->
        <div class="follow-wrapper" v-if="!isMyProfile">
          <button class="follow-button" :class="followButtonClass" @click="handleFollow">
            {{ followButtonText }}
          </button>
        </div>
      </div>

      <div class="user-stats">
        <span>게시글 <strong>{{ postCount }}</strong>개</span>
        <span @click="openFollowerModal" style="cursor: pointer;">
          팔로워 <strong>{{ followerCount }}</strong>
        </span>
        <span @click="openFollowingModal" style="cursor: pointer;">
          팔로우 <strong>{{ followingCount }}</strong>
        </span>
      </div>

      <p class="user-bio">{{ userData.bio }}</p>

      <!-- 프로필 음악 -->
      <div class="music-info" @click="togglePlayback">
        <span>🎵 {{ musicTitle }}</span>
        <span class="time-info">{{ formattedTime }} / {{ formattedDuration }}</span>
        <l-waveform v-if="isPlaying" size="18" stroke="2.5" speed="1" color="gray" style="margin-left: 8px;" />
      </div>

      <!-- 내 프로필이면 프로필 편집 버튼 -->
      <div class="button-group" v-if="isMyProfile">
        <v-btn color="gray" variant="flat" @click="editProfile">프로필 편집</v-btn>
        <v-btn color="gray" variant="flat" @click="editAccount">개인 정보 설정</v-btn>
      </div>
    </div>

    <audio ref="audioPlayer" :src="userData.profileMusic" preload="auto" class="hidden" @timeupdate="onTimeUpdate"
      @ended="isPlaying = false" />

    <!-- 팔로워/팔로잉 모달 연결 -->
    <FollowerModal v-if="showFollowerModal" :memberId="userData.id" @close="closeModals" />
    <FollowingModal v-if="showFollowingModal" :memberId="userData.id" @close="closeModals" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { waveform } from 'ldrs'
import axios from 'axios'
import { useNotificationStore } from '@/stores/notificationStore'


// 모달 컴포넌트 import
import FollowerModal from '@/components/follow/follower.vue'
import FollowingModal from '@/components/follow/following.vue'

const notificationStore = useNotificationStore()

const props = defineProps({
  userData: Object,
  isMine: Boolean
})

const userStore = useUserStore()
const router = useRouter()
const token = userStore.token

// 음악 관련
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

const isMyProfile = computed(() => props.isMine)

const followButtonText = computed(() => {
  if (props.userData.isFollowing === true) return '팔로잉'
  if (props.userData.isFollowing === 'wait') return '수락 대기'
  return '팔로우'
})

const followButtonClass = computed(() => {
  if (props.userData.isFollowing === true) return 'btn-following'
  if (props.userData.isFollowing === 'wait') return 'btn-wait'
  return 'btn-follow'
})

waveform.register()

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

function onTimeUpdate() {
  currentTime.value = audioPlayer.value?.currentTime || 0
  duration.value = audioPlayer.value?.duration || 0
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

// --- 프로필 통계 가져오기 ---
const followerCount = ref(0)
const followingCount = ref(0)
const postCount = ref(0)

async function fetchProfileCounts(memberId) {
  try {
    const [followingRes, followerRes, postRes] = await Promise.all([
      axios.get(`http://localhost:8080/api/mypage/follow/count`, { params: { memberId } }),
      axios.get(`http://localhost:8080/api/mypage/follow/count/follower`, { params: { memberId } }),
      axios.get(`http://localhost:8080/api/mypage/posts/count`, { params: { memberId } })
    ])
    followingCount.value = followingRes.data
    followerCount.value = followerRes.data
    postCount.value = postRes.data
  } catch (e) {
    console.error('프로필 카운트 가져오기 실패:', e)
  }
}

watch(() => props.userData?.id, (newId) => {
  if (newId) fetchProfileCounts(newId)
})

onMounted(() => {
  if (props.userData?.id) fetchProfileCounts(props.userData.id)
  // ✅ 프로필 음악이 있을 때 자동 재생 시도
  if (props.userData?.profileMusic) {
    setTimeout(() => {  // 약간 늦게 실행 (브라우저 정책 우회용)
      togglePlayback()
    }, 300)
  }
  
})

// --- 모달 관리 ---
const showFollowerModal = ref(false)
const showFollowingModal = ref(false)

const openFollowerModal = () => {
  showFollowerModal.value = true
}
const openFollowingModal = () => {
  showFollowingModal.value = true
}
const closeModals = () => {
  showFollowerModal.value = false
  showFollowingModal.value = false
}

// --- 프로필 수정 이동 ---
const editProfile = () => router.push('/edit/profile')
const editAccount = () => router.push('/edit/account')

// --- 팔로우 / 언팔로우 처리 ---
const handleFollow = async () => {
  if (!token) {
    alert('로그인이 필요합니다.')
    return
  }

  try {
    const isFollowing = props.userData.isFollowing
    const method = isFollowing ? 'DELETE' : 'POST'

    const res = await fetch('http://localhost:8080/api/follow', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        followingMemberId: userStore.id,
        followTargetMemberId: props.userData.id,
        ...(method === 'POST' && { status: props.userData.isPublic })
      })
    })

    if (!res.ok) throw new Error('Follow action failed')

    if (method === 'POST') {
      if (props.userData.isPublic) {
        props.userData.isFollowing = true
        followerCount.value += 1
        alert('팔로우 성공!')
      } else {
        props.userData.isFollowing = 'wait'
        alert('팔로우 요청 보냈습니다!')
      }

      // 📢 알림 새로고침 추가
      await notificationStore.fetchNotifications()
    } else {
      props.userData.isFollowing = false
      followerCount.value -= 1
      alert('언팔로우 성공!')
    }
  } catch (error) {
    console.error('팔로우/언팔로우 실패:', error)
    alert('오류가 발생했습니다.')
  }
}
</script>

<style scoped>
/* ✅ 네가 작성한 기존 CSS 그대로 복사 */
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
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: fit-content;
  height: fit-content;
  transition: background-color 0.3s, color 0.3s;
}

.btn-follow {
  background-color: #1f2937;
  color: white;
}

.btn-following {
  background-color: #FFE8F3;
  color: #efb8c8;
}

.btn-wait {
  background-color: #D9D9D9;
  color: #B3B3B3;
}

.hidden {
  display: none;
}
</style>
