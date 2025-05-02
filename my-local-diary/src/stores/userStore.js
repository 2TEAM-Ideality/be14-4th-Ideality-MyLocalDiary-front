// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const id = ref(null)
  const token = ref(null)  // access token 담는 용도
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

  async function login(accessToken) {
    token.value = accessToken

    try {
      const response = await axios.get('/api/member/info', {
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
        token: token.value,
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
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error)
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await axios.post('/api/member/logout', null, {
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
    token.value = null
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
  }

  async function restoreUser() {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) return

    try {
      console.log("reissu 신청 가나연")
      const res = await axios.post('/api/member/reissue', null, {
        withCredentials: true
      })
      console.log("res", res.data.data.accessToken)
      const newAccessToken = res.data.data.accessToken
      token.value = newAccessToken
      console.log(token.value);

      const user = JSON.parse(savedUser)
      token.value = user.token
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
      const res = await axios.post('/api/member/reissue', null, {
        withCredentials: true
      })
      const newAccessToken = res.data.data.accessToken
      token.value = newAccessToken

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