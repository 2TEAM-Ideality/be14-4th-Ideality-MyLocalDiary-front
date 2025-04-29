<template>
  <div class="box">
    <div v-if="isLoading" class="loading-wrapper">
      <LoadingModal :today="new Date()" :message="fetchingUserMessage"/>
    </div>
    <div v-else>
      <h2 class="text-h5 font-weight-bold text-center mb-8" style="color: #ff6666">프로필 편집</h2>

      <!-- 프로필 이미지 -->
      <div class="d-flex flex-column align-center mb-4">
        <v-avatar size="100" class="mb-2">
          <img :src="localProfileImage" alt="프로필 이미지" style="width: 100%; height: 100%; object-fit: cover;" />
        </v-avatar>

        <div class="button-group">
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          <v-btn size="small" color="black" variant="outlined" @click="triggerFileInput">
            프로필 사진 변경
          </v-btn>
          <v-btn size="small" color="error" variant="text" class="ml-2" @click="resetProfileImage">
            프로필 사진 삭제
          </v-btn>
        </div>
      </div>

      <!-- 닉네임 -->
      <v-text-field label="닉네임" v-model="nickname" />

      <!-- 프로필 뮤직 -->
      <div class="d-flex flex-column  mb-4">
        <v-select
          style="width: 100%;"
          label="프로필 뮤직"
          :items="musicOptions"
          v-model="selectedMusic"
          prepend-inner-icon="mdi-music"
        />
        <div class="d-flex justify-end mt-2">
          <v-btn size="small" color="error" variant="text" @click="resetProfileMusic">
            프로필 뮤직 삭제
          </v-btn>
        </div>
      </div>


      <!-- 공개 범위 -->
      <div class="d-flex align-center justify-space-between my-4">
        <div>
          <div class="font-weight-medium">계정 공개 범위</div>
          <div class="text-caption">현재 {{ isPublic ? '공개' : '비공개' }} 상태입니다.</div>
        </div>
        <v-switch v-model="isPublic" hide-details />
      </div>

      <!-- 소개 -->
      <v-textarea label="소개" rows="4" v-model="bio" />

      <!-- 버튼 -->
      <v-btn color="black" class="mt-6 button" @click="submitProfile">프로필 편집 완료</v-btn>

      <!-- 모달 -->
      <LoadingModal v-if="showModal" :today="new Date()"  :message="editProfileMessage"/>

    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import axios from 'axios'
import LoadingModal from '@/components/common/LoadingModal.vue'

const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(true)   // 초기 유저 데이터 가져올 때 로딩 
const showModal = ref(false)  // 편집 완료 시 로딩 
const fetchingUserMessage = ref(`${userStore.nickname} 님의 데이터 불러오는 중`)
const editProfileMessage = ref('저장 중')

// form 입력값
const nickname = ref('')
const selectedMusic = ref('')
const isPublic = ref(false)
const bio = ref('')
const localProfileImage = ref('/images/profile/defaultProfile.png')
const uploadedFile = ref(null) // 🔥 새로 선택한 파일 저장
const fileInput = ref(null)

const musicOptions = [
  'aespa - Supernova',
  '프리스타일 - Y',
  '잔나비 - 주저하는 연인들을 위해',
  '박재범 - 좋아'
]

// onMounted
onMounted(async () => {
  isLoading.value = true
  await userStore.restoreUser()
  nickname.value = userStore.nickname
  selectedMusic.value = getFileNameFromUrl(userStore.profileMusic)
  isPublic.value = userStore.isPublic === 'TRUE'
  bio.value = userStore.bio
  localProfileImage.value = userStore.profileImage || '/images/profile/defaultProfile.png'
  isLoading.value = false
})

// 🔥 파일 선택 (업로드 안 하고, 미리보기만)
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadedFile.value = file
    localProfileImage.value = URL.createObjectURL(file) // 미리보기
  }
}

// 🔥 프로필 사진 삭제
const resetProfileImage = () => {
  uploadedFile.value = null
  localProfileImage.value = '/images/profile/defaultProfile.png'
}

// 🔥 프로필 뮤직 삭제
const resetProfileMusic = () => {
  selectedMusic.value = ''
}

// 🔥 프로필 저장
const submitProfile = async () => {
  try {
    let profileImagePath = userStore.profileImage // 기본은 기존 프로필 이미지

    // 만약 새 파일을 선택했다면, 이때 S3에 업로드
    if (uploadedFile.value) {
      const formData = new FormData()
      formData.append('file', uploadedFile.value)
      formData.append('userId', userStore.id)

      const response = await axios.post('/api/s3/upload/member-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      profileImagePath = `https://my-local-diary-prod.s3.ap-northeast-2.amazonaws.com/${response.data}`
    }
    console.log('🔥프로필 사진 업로드 성공')
    // 프로필 PATCH
    // const updated = {
    //   nickname: nickname.value,
    //   profile_music: selectedMusic.value,
    //   is_public: isPublic.value ? 'TRUE' : 'FALSE',
    //   bio: bio.value,
    //   profile_image: profileImagePath
    // }

    // await axios.('/api/member/profile', updated)
    // console.log('프로필 업데이트 성공')
    showModal.value = true
    setTimeout(() => {
      showModal.value = false
      router.push('/mypage')
    }, 2000)

  } catch (error) {
    console.error('프로필 업데이트 실패:', error)
  }
}

// 파일명 추출
function getFileNameFromUrl(url) {
  if (!url) return ''
  return url.split('/').pop().replace(/\.[^/.]+$/, '')
}
</script>



<style scoped>
.box {
  padding: 8% 12%;
}

.font-weight-medium {
  font-weight: 500;
}

.button {
  width: fit-content;
  float: right;
}

.hidden {
  display: none;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.mb-2 {
  border: 1px solid rgb(219, 219, 219);
}
</style>
