<template>
  <div class="box">
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
    <LoadingModal v-if="showModal" :today="new Date()" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import LoadingModal from '@/components/common/LoadingModal.vue'
import { useUserStore } from '@/stores/userStore.js' 

const router = useRouter()
const userStore = useUserStore() 
const showModal = ref(false)

// 🔥 userStore에서 유저정보 가져와서 초기화할 것
const nickname = ref('')
const selectedMusic = ref('')
const isPublic = ref(false)
const bio = ref('')
const localProfileImage = ref('/images/profile/defaultProfile.png')
const fileInput = ref(null)

const musicOptions = [
  'aespa - Supernova',
  '프리스타일 - Y',
  '잔나비 - 주저하는 연인들을 위해',
  '박재범 - 좋아'
]

// onMounted 때 userStore에서 가져오기
onMounted(async () => {
  await userStore.restoreUser()

  // ✅ 가져온 유저정보를 세팅
  nickname.value = userStore.nickname;
  selectedMusic.value = getFileNameFromUrl(userStore.profileMusic);
  isPublic.value = userStore.isPublic === 'TRUE'
  bio.value = userStore.bio
  localProfileImage.value = userStore.profileImage || '/images/profile/defaultProfile.png'
  console.log(userStore.profileMusic)
})

// 🔥 파일 업로드
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userStore.id); 

      // 1. S3 업로드 요청 보내기
      const response = await axios.post('/api/s3/upload/member-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      console.log('S3 업로드 성공:', response.data)

      // 업로드 성공하면 반환된 S3 경로를 프로필 이미지로 세팅
      const s3Key = response.data
      localProfileImage.value = `https://my-local-diary-prod.s3.ap-northeast-2.amazonaws.com/${s3Key}`
    } catch (error) {
      console.error('S3 업로드 실패:', error)
    }
  }
}


// 🔥 프로필 사진 삭제
const resetProfileImage = () => {
  localProfileImage.value = '/images/profile/defaultProfile.png'
}

// 🔥 프로필 뮤직 삭제
const resetProfileMusic = () => {
  selectedMusic.value = ''
}

// 🔥 프로필 저장
const submitProfile = async () => {
  const updated = {
    nickname: nickname.value,
    profile_music: selectedMusic.value,
    is_public: isPublic.value ? 'TRUE' : 'FALSE',
    bio: bio.value,
    profile_image: localProfileImage.value
  };

  try {
    await axios.patch('/api/member/profile', updated); // 예시 URL
    console.log('프로필 업데이트 성공');
    showModal.value = true;
    setTimeout(() => {
      showModal.value = false;
      router.push('/mypage');
    }, 2000);
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
  }
}



// 프로필 뮤직 음악 
function getFileNameFromUrl(url) {
  return url.split('/').pop().replace(/\.[^/.]+$/, '');
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
