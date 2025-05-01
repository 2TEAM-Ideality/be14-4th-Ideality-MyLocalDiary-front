// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  // ✅ state
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
  const followers = ref(0)
  const following = ref(0)
  const posts = ref(0)

  const isLoggedIn = computed(() => !!id.value)

  const welcomeMessage = computed(() => {
    return nickname.value ? `안녕하세요, ${nickname.value}님!` : ''
  })

  async function login(accessToken, refreshToken) {
    console.log('로그인하러 넘어 옴')

    // 1. 액세스 토큰, 리프레시 토큰 저장
    localStorage.setItem('refreshToken', refreshToken);
    
    token.value = accessToken;

    console.log(token.value)

    try {
      // 2. 토큰으로 사용자 정보 요청
      console.log('사용자 정보 요청');
      const response = await axios.get('http://localhost:8080/api/member/info', {
        headers: {
          Authorization: `Bearer ${accessToken}`
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
        token: token.value,   // 액세스 토큰
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

  function logout() {
    // 1. 상태 초기화
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
    followers.value = 0
    following.value = 0
    posts.value = 0
  
    // 2. localStorage 정리
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
    const savedToken = savedUser ? JSON.parse(savedUser).token : null;
  
    if (!savedUser || !savedToken) {
      console.warn("❌ 저장된 사용자 없음 또는 토큰 없음");
      logout(); // 상태 초기화
      return;
    }
  
    try {
      const user = JSON.parse(savedUser);
      token.value = user.token;
  
      const response = await axios.get('http://localhost:8080/api/member/info', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });
  
      const memberData = response.data.data;
  
      // 상태 갱신
      id.value = memberData.memberId;
      loginId.value = memberData.loginId;
      name.value = memberData.name;
      nickname.value = memberData.nickname;
      email.value = memberData.email;
      birth.value = '';
      role.value = memberData.role;
      status.value = memberData.status;
      isPublic.value = memberData.isPublic;
      bio.value = memberData.bio;
      profileImage.value = memberData.profileImage || '/images/profile/defaultProfile.png';
      profileMusic.value = memberData.profileMusic;
  
      await fetchProfileStats();
    } catch (err) {
      console.error('❌ restoreUser 실패 - 토큰이 유효하지 않거나 서버 오류:', err);
      logout(); // 복원이 실패했으면 안전하게 로그아웃 처리
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
    followers,
    following,
    posts,
    login,
    logout,
    fetchProfileStats,
    restoreUser
  }
})