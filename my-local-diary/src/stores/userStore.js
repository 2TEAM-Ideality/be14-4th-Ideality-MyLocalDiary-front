// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', () => {
  // ✅ state
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
  const followers = ref(0)
  const following = ref(0)
  const posts = ref(0)

  // 강제 로그아웃(토큰 만료)
  const forcedLogout = ref(false)

  const isLoggedIn = computed(() => !!id.value)

  const welcomeMessage = computed(() => {
    return nickname.value ? `안녕하세요, ${nickname.value}님!` : ''
  })

  async function login(accessToken) {
    console.log('로그인하러 넘어 옴')

    // 1. 액세스 토큰, 리프레시 토큰 저장 -> 리프레시 토큰은 이제 http-only 쿠키로 관리
    // localStorage.setItem('refreshToken', refreshToken);
    token.value = accessToken;
    console.log(token.value)

    try {
      // 2. 토큰으로 사용자 정보 요청
      console.log('사용자 정보 요청');
      const response = await axios.get('http://localhost:8080/api/member/info', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });

      console.log("✅ 전체 응답 확인", response);
      console.log("✅ 데이터 확인", response.data);

      const memberData = response.data.data;
      console.log("👤 memberData", memberData);

      // 상태 갱신 주석 해제
      id.value = memberData.memberId;
      loginId.value = memberData.loginId;
      name.value = memberData.name;
      nickname.value = memberData.nickname;
      email.value = memberData.email;
      birth.value = ''; // 생일 없음
      role.value = memberData.role;
      status.value = memberData.status;
      isPublic.value = memberData.isPublic;
      bio.value = memberData.bio;
      profileImage.value = memberData.profileImage || '/images/profile/defaultProfile.png';
      profileMusic.value = memberData.profileMusic;

      await fetchProfileStats();

      localStorage.setItem('user', JSON.stringify({
        // token: token.value,   // 액세스 토큰
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
      }));
    } catch (error) {
      console.error("❌ 사용자 정보 조회 실패:", error);
      if (error.response) {
        console.error("❗ 응답 상태:", error.response.status);
        console.error("❗ 응답 데이터:", error.response.data);
      } else {
        console.error("❗ 응답 없음 또는 네트워크 에러:", error.message);
      }
    }
  }

  // ✅ 서버 로그아웃 + 상태 초기화
  async function logout() {
    try {
      if (token.value) {
        await axios.post('http://localhost:8080/api/member/logout', null, {
          headers: { Authorization: `Bearer ${token.value}` },
          withCredentials: true,
        })
      }
    } catch (error) {
      console.warn("❌ 로그아웃 요청 실패, 무시하고 상태 초기화 진행")
    }

    // 상태 초기화
    clearState()
  }

  // ✅ 강제 로그아웃 처리
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
    followers.value = 0
    following.value = 0
    posts.value = 0
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
  }

  async function fetchProfileStats() {
    if (!id.value) {
      console.warn('로그인 안 되어 있음');
      return;
    }

    try {
      const [followRes, postRes] = await Promise.all([
        fetch('http://localhost:3001/follow'),
        fetch('http://localhost:3001/post')
      ]);

      const follow = await followRes.json();
      const postsData = await postRes.json();

      const myId = String(id.value);

      following.value = follow.filter(f => f.following_member_id === myId).length;
      followers.value = follow.filter(f => f.follower_target_member_id === myId).length;
      posts.value = postsData.filter(p => String(p.member_id) === myId).length;

    } catch (error) {
      console.error('프로필 통계 가져오기 실패:', error);
    }
  }
  async function restoreUser() {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {

      try {
        const res = await axios.post('http://localhost:8080/api/member/reissue', null, {
          withCredentials: true
        });

        const newAcessToken = res.data.data.accessToken;
        console.log(newAcessToken);
        token.value = newAcessToken;
        const user = JSON.parse(savedUser);

        id.value = user.id;
        loginId.value = user.loginId;
        name.value = user.name;
        nickname.value = user.nickname;
        email.value = user.email;
        birth.value = user.birth;
        role.value = user.role;
        status.value = user.status;
        isPublic.value = user.isPublic;
        bio.value = user.bio;
        profileImage.value = user.profileImage;
        profileMusic.value = user.profileMusic;

        await fetchProfileStats();
      } catch (err) {
        if (err.response && err.response.status == 401) {
          const msg = err.response.data.message;
          alert(msg);
        }
        logout();
      }

    }
  }

  async function tryReissueToken() {
    try {
      const res = await axios.post('http://localhost:8080/api/member/reissue', null, {
        withCredentials: true // ✅ refresh-token은 httpOnly 쿠키
      })
      const newAccessToken = res.data.data.accessToken
      token.value = newAccessToken

      const saved = JSON.parse(localStorage.getItem('user') || '{}')
      saved.token = newAccessToken
      localStorage.setItem('user', JSON.stringify(saved))
    } catch (err) {
      console.error("⛔ 재발급 실패. 로그아웃 처리")
      forcedLogout.value = true
      logout()
      router.push('/')
    }
  }

  // 🔁 30초마다 access token 만료 확인
  setInterval(() => {
    if (!token.value) return
    try {
      const decoded = jwtDecode(token.value)
      const now = Math.floor(Date.now() / 1000)
      const exp = decoded.exp
      const remaining = exp - now
      if (remaining <= 60) {
        tryReissueToken()
      }
    } catch (e) {
      console.error("⛔ JWT 디코드 실패", e)
    }
  }, 30000)

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
    followers,
    following,
    posts,
    login,
    logout,
    fetchProfileStats,
    restoreUser,
    tryReissueToken,
    forceLogout
  }
})