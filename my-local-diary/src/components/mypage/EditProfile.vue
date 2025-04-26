<template>
    <div class="box">
      <h2 class="text-h5 font-weight-bold text-center mb-8" style="color: #ff6666">프로필 편집</h2>
  
      <!-- 프로필 이미지 -->
      <div class="d-flex align-center mb-4">
        <v-avatar size="100" class="mr-4">
          <img :src="localProfileImage" alt="프로필 이미지" />
        </v-avatar>
        <v-btn size="small" color="black" variant="outlined">프로필 사진 변경</v-btn>
      </div>
  
      <!-- 닉네임 -->
      <v-text-field label="닉네임" v-model="nickname" />
  
      <!-- 프로필 뮤직 -->
      <v-select
        label="프로필 뮤직"
        :items="musicOptions"
        v-model="selectedMusic"
        prepend-inner-icon="mdi-music"
      />
  
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
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import LoadingModal from '@/components/common/LoadingModal.vue'
  
  const props = defineProps({
    user: {
      type: Object,
      required: true
    }
  })
  
  const router = useRouter()
  const showModal = ref(false)
  
  const nickname = ref('')
  const selectedMusic = ref('')
  const isPublic = ref(false)
  const bio = ref('')
  const localProfileImage = ref('')
  
  const musicOptions = [
    'aespa - Supernova',
    '프리스타일 - Y',
    '잔나비 - 주저하는 연인들을 위해',
    '박재범 - 좋아'
  ]
  
  watch(
    () => props.user,
    (val) => {
      if (val) {
        nickname.value = val.nickname
        selectedMusic.value = val.profile_music
        isPublic.value = val.is_public === 'TRUE'
        bio.value = val.bio
        localProfileImage.value = val.profile_image || '/images/profile/defaultProfile.png'
      }
    },
    { immediate: true }
  )
  
  const submitProfile = () => {
    const updated = {
      nickname: nickname.value,
      profile_music: selectedMusic.value,
      is_public: isPublic.value ? 'TRUE' : 'FALSE',
      bio: bio.value
    }
  
    console.log('저장된 값:', updated)
  
    // 모달 보여주기
    showModal.value = true
  
    // 2초 후 /mypage로 이동
    setTimeout(() => {
      showModal.value = false
      router.push('/edit-profile')
    }, 2000)
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
  </style>
  