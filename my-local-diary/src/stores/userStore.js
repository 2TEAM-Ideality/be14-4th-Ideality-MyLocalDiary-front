import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 유저 정보가 담긴  
export const useUserStore = defineStore('user', () => {
  // ✅ state
  const id = ref(null)
  const loginId = ref('')
  const name = ref('')
  const nickname = ref('')
  const email = ref('')
  const birth = ref('')
  const role = ref('')
  const status = ref('')
  const isPublic = ref(true)
  const bio = ref('')
  const profileImage = ref(null)
  const profileMusic = ref(null)

  const isLoggedIn = computed(() => !!id.value)

  // ✅ getter
  const welcomeMessage = computed(() => {
    return nickname.value ? `안녕하세요, ${nickname.value}님!` : ''
  })

  // ✅ actions
  function login(memberData) {
    id.value = memberData.id
    loginId.value = memberData.login_id
    name.value = memberData.name
    nickname.value = memberData.nickname
    email.value = memberData.email
    birth.value = memberData.birth
    role.value = memberData.role
    status.value = memberData.status
    isPublic.value = memberData.is_public === 'TRUE'
    bio.value = memberData.bio
    profileImage.value = memberData.profile_image
    profileMusic.value = memberData.profile_music
  }

  function logout() {
    id.value = null
    loginId.value = ''
    name.value = ''
    nickname.value = ''
    email.value = ''
    birth.value = ''
    role.value = ''
    status.value = ''
    isPublic.value = true
    bio.value = ''
    profileImage.value = null
    profileMusic.value = null
  }

  return {
    id,
    loginId,
    name,
    nickname,
    email,
    birth,
    role,
    status,
    isPublic,
    bio,
    profileImage,
    profileMusic,
    isLoggedIn,
    welcomeMessage,
    login,
    logout
  }
})
