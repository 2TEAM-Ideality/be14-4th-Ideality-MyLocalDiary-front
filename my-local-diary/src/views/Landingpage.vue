<template>
    <v-container fluid class="fill-height d-flex align-center justify-center pa-4" style="background-color: black; color: white;">
      <v-row class="ma-0" align="center" justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-card class="d-flex flex-row pa-0" elevation="6" style="background-color: transparent;">
            
            <!-- 왼쪽: 로고 영역 -->
            <v-col class="d-flex flex-column align-center justify-center pa-8" style="margin-right: 70px;">
              <v-img src="/src/assets/logo/My_Local_Diary_Black.png" contain width="500" height="300" />
              <h1 class="white--text text-h4 font-weight-bold mt-4 text-center">My Local Diary</h1>
            </v-col>
  
            <!-- 오른쪽: 로그인 폼 -->
            <v-col class="pa-8" style="background-color: #111; border-radius: 12px;">
              <div class="d-flex justify-center mb-6">
                <v-img src="/src/assets/cursor/cursor_ 10.svg" max-width="80" />
              </div>
  

              <v-text-field
                label="아이디"
                v-model="inputId"
                variant="filled"
                color="white"
                class="mb-4"
                hide-details
                density="comfortable"
                style="background-color: #333; color:white;"
              ></v-text-field>
  
              <v-text-field
                label="비밀번호"
                v-model="inputPw"
                type="password"
                variant="filled"
                color="white"
                class="mb-4"
                hide-details
                density="comfortable"
                style="background-color: #333; color:white;"
              ></v-text-field>
  
              <v-btn  @click="login" block color="white" class="text-black font-weight-bold mb-6" height="48">
                로그인
              </v-btn>
  
              <v-row class="align-center my-4">
  <v-col><v-divider color="white" thickness="1"></v-divider></v-col>
  <span class="text-grey-lighten-1 px-4">또는</span>
  <v-col><v-divider color="white" thickness="1"></v-divider></v-col>
</v-row>

  
              <v-btn block color="yellow" class="text-black font-weight-bold" height="48" @click="redirectToKakao">
                <v-img src="/src/assets/logo/kakao_logo.png" width="40" class="mr-2" />
                카카오로 로그인
              </v-btn>
  
              <div class="text-center mt-6 text-grey-lighten-1 text-caption">
                아직 계정이 없으신가요?
                <a href="#" @click.prevent="showModal = true" class="text-white font-weight-bold ml-1">
                    회원가입 하기
                </a>
                <br>
                비밀번호를 잊어버리셨나요?
                <a href="#" class="text-white font-weight-bold ml-1">비밀번호 찾기</a>
              </div>

            </v-col>
          </v-card>
        </v-col>
      </v-row>
      <AuthModal v-if="showModal" @close="showModal = false" />
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import AuthModal from '@/components/auth/AuthModal.vue'
  import { useUserStore } from '@/stores/userStore'
  
  const userStore = useUserStore();

  const showModal = ref(false)

  const router = useRouter();

  const inputId = ref("");
  const inputPw = ref("");

  // 
  onMounted(async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        // // 👉 서버에 토큰으로 사용자 정보 요청 (예시: /api/auth/me)
        // const res = await axios.get('http://localhost:8080/api/auth/me', {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // })

        // ✅ 사용자 정보 Pinia에 저장
        // await userStore.login(token)

        // ✅ 자동으로 홈으로 이동
        router.push('/home')
      } catch (e) {
        console.warn('❌ 토큰 유효하지 않음 → 로그인 필요')
        localStorage.removeItem('accessToken')
      }
    }
  })

  // 로그인 처리 
  function redirectToKakao() {
    window.location.href = 'http://localhost:8080/login/kakao';
  }

  async function login()  {
    try {
      console.log(inputId.value, inputPw.value)

      const response = await axios.post('http://localhost:8080/api/auth/login', {
        loginId: inputId.value,
        password: inputPw.value 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const token = response.data.data.accessToken;
      console.log('✅ JWT Token 확인 테스트:', token);

      await userStore.login(token); 

      router.push('/home');  // 메인 홈으로 이동

    } catch (error) {
      if (error.response) {
        console.error('에러 응답:', error.response.data);
      } else {
        console.error('요청 실패:', error.message);
      }
    }
  }
  </script>
  
  <style scoped>
  </style>
  