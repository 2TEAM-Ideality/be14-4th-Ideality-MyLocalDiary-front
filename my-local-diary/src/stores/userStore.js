// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const id = ref(null)
  const token = ref(null)
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
  const forcedLogout = ref(false)

  const isLoggedIn = computed(() => !!id.value)

  const welcomeMessage = computed(() => {
    return nickname.value ? `안녕하세요, ${nickname.value}님!` : ''
  })

  async function login(accessToken, refreshToken) {
    token.value = accessToken

    try {
      const response = await axios.get('http://localhost:8080/api/member/info', {
        headers: { Authorization: `Bearer ${token.value}` }
      })

      const memberData = response.data.data

      id.value = memberData.memberId
      loginId.value = memberData.loginId
      name.value = memberData.name
      nickname.value = memberData.nickname
      email.value = memberData.email
      birth.value = ''
      role.value = memberData.role
      status.value = memberData.status
      isPublic.value = memberData.isPublic
      bio.value = memberData.bio
      profileImage.value = memberData.profileImage || '/images/profile/defaultProfile.png'
      profileMusic.value = memberData.profileMusic

      localStorage.setItem('user', JSON.stringify({
        id: id.value,
        loginId: loginId.value,
        name: name.value,
        nickname: nickname.value,
        email: email.value,
        birth: birth.value,
        role: role.value,
        status: status.value,
        isPublic: isPublic.value,
        bio: bio.value,
        profileImage: profileImage.value,
        profileMusic: profileMusic.value
      }))
      localStorage.setItem('refreshToken', refreshToken)
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error)
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await axios.post('http://localhost:8080/api/member/logout', null, {
          headers: { Authorization: `Bearer ${token.value}` },
          withCredentials: true
        })
      }
    } catch (e) {
      console.warn("로그아웃 실패 무시")
    }
    clearState()
  }

  function forceLogout() {
    forcedLogout.value = true
    clearState()
  }

  function clearState() {
    token.value = null
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

    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken")
  }

  async function restoreUser() {
    const savedUser = localStorage.getItem('user')
    const refreshToken = localStorage.getItem('refreshToken')  // ✅ 추가
    console.log(refreshToken)
    if (!savedUser || !refreshToken) return

    try {
      const res = await axios.post('http://localhost:8080/api/member/reissue', null, {
        headers: {
          'refresh-token': refreshToken
        }
      })

      const newAccessToken = res.data.data.accessToken
      token.value = newAccessToken

      const user = JSON.parse(savedUser)
      id.value = user.id
      loginId.value = user.loginId
      name.value = user.name
      nickname.value = user.nickname
      email.value = user.email
      birth.value = user.birth
      role.value = user.role
      status.value = user.status
      isPublic.value = user.isPublic
      bio.value = user.bio
      profileImage.value = user.profileImage
      profileMusic.value = user.profileMusic

    } catch (err) {
      forcedLogout.value = true
      logout()
    }
  }
  async function tryReissueToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')

      const res = await axios.post('http://localhost:8080/api/member/reissue', null, {
        headers: {
          'refresh-token': refreshToken
        }
      })

      const newAccessToken = res.data.data.accessToken
      token.value = newAccessToken
      localStorage.setItem('accessToken', newAccessToken)

      const saved = JSON.parse(localStorage.getItem('user') || '{}')
      saved.token = newAccessToken
      localStorage.setItem('user', JSON.stringify(saved))

      return true
    } catch (e) {
      forcedLogout.value = true
      clearState()
      return false
    }
  }

  return {
    id,
    token,
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
    logout,
    forceLogout,
    clearState,
    restoreUser,
    tryReissueToken
  }
})
