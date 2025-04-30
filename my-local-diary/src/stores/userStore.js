// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  const followers = ref(0)
  const following = ref(0)
  const posts = ref(0)

  const isLoggedIn = computed(() => !!id.value)
  const welcomeMessage = computed(() => {
    return nickname.value ? `안녕하세요, ${nickname.value}님!` : ''
  })

  async function login(token) {
    // 1. 토큰 저장
    localStorage.setItem("accessToken", token);

    // try {
      // 2. 토큰으로 사용자 정보 요청
      // const response = await axios.get("http://localhost:8080/api/auth/me", {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // });

    // const memberData = response.data;
    
    // id.value = memberData.id
    // loginId.value = memberData.login_id
    // name.value = memberData.name
    // nickname.value = memberData.nickname
    // email.value = memberData.email
    // birth.value = memberData.birth
    // role.value = memberData.role
    // status.value = memberData.status
    // isPublic.value = memberData.is_public === 'TRUE'
    // bio.value = memberData.bio
    // profileImage.value = memberData.profile_image || '/images/profile/defaultProfile.png';
    // profileMusic.value = memberData.profile_music

    // await fetchProfileStats()

    // localStorage.setItem('user', JSON.stringify({
    //   id: id.value,
    //   loginId: loginId.value,
    //   name: name.value,
    //   nickname: nickname.value,
    //   email: email.value,
    //   birth: birth.value,
    //   role: role.value,
    //   status: status.value,
    //   isPublic: isPublic.value,
    //   bio: bio.value,
    //   profileImage: profileImage.value,
    //   profileMusic: profileMusic.value
    // }))
  // }catch (error) {
  //   console.error("사용자 정보 조회 실패:", error);
  //   throw error;
  // }
  }

  function logout() {
    // 1. 상태 초기화
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
  
    // 2. localStorage 정리
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')  // 토큰 없애기 
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
    } else {
      id.value = '5';
      loginId.value = 'test05';
      name.value = '사륜안';
      nickname.value = 'Madara Uchiha';
      email.value = 'test05@example.com';
      birth.value = '1995-02-11';
      role.value = 'MEMBER';
      status.value = 'ACTIVE';
      isPublic.value = true;
      bio.value = '소도시의 숨은 매력을 발굴하는 여행 에디터.';
      // profileImage.value = '/images/profile/profile.png';
      profileImage.value ='https://my-local-diary-prod.s3.ap-northeast-2.amazonaws.com/member/profile_images/445a50e3-8d7f-4997-949f-fa3fc1ca1741_image%20(2).webp';
      profileMusic.value = 'https://rococo-cocada-2c23e0.netlify.app/audio/잔나비 (JANNABI) - 주저하는 연인들을 위해.mp3';
  
      await fetchProfileStats();
    }
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
    followers,
    following,
    posts,
    login,
    logout,
    fetchProfileStats,
    restoreUser
  }
})
