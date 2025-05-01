<template>
  <v-dialog v-model="internalDialog" max-width="500" persistent>
    <v-card class="pa-6 rounded-xl" style="border-radius: 24px;">
      <v-btn
        icon
        size="small"
        class="close-btn"
        @click="internalDialog = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <div class="text-center mb-6">
        <img src="/src/assets/logo/My_Local_Diary.png" alt="logo" width="100" class="mb-2" />
        <h2 class="text-h5 font-weight-bold">My local Diary</h2>
      </div>

      <v-form>
        <v-text-field v-model = "loginId" 
        label="아이디" 
        variant="outlined" 
        dense class="mb-3" 
        :error="!isLoginIdAvailable"
        :hint="isLoginIdAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'"
        />

        <!-- 이메일 + 인증하기 버튼 -->
        <v-text-field
          v-model="email"
          label="이메일 주소"
          variant="outlined"
          dense
          class="mb-1"
        >
          <template #append-inner>
            <v-btn
              size="x-small"
              variant="outlined"
              @click="sendEmailVerification"
            >
              인증하기
            </v-btn>
          </template>
        </v-text-field>

        <!-- 인증번호 입력칸 + 인증완료 버튼 오른쪽 배치 -->
        <div class="d-flex align-center mb-3">
          <v-text-field
            v-model="verifyCode"
            label="인증번호 입력하기"
            variant="outlined"
            dense
            class="flex-grow-1 me-2"
          />
          <v-btn
            size="small"
            :color="isEmailVerified ? 'pink-lighten-4' : 'grey'"
            variant="flat"
            :disabled="!isEmailVerified"
            @click = sendVerificationCode
          >
            인증 완료
          </v-btn>
        </div>

        <!-- 비밀번호 입력 -->
        <v-text-field
          v-model="password"
          label="비밀번호"
          type="password"
          variant="outlined"
          dense 
          class="mb-3"
        />
        <v-text-field
          v-model="confirmPassword"
          label="비밀번호 확인"
          type="password"
          variant="outlined"
          dense
          class="mb-1"
        />

        <!-- 비밀번호 일치 여부 표시 -->
        <div v-if="confirmPassword" class="text-caption mb-4" :style="{ color: passwordsMatch ? '#4caf50' : 'red' }">
          {{ passwordsMatch ? '비밀번호가 일치합니다.' : '비밀번호를 다시 확인해주세요.' }}
        </div>

        <v-text-field v-model = "name" label="이름" variant="outlined" dense class="mb-3" />
        <v-text-field v-model = "nickname" 
        label="닉네임" 
        variant="outlined" 
        dense class="mb-3" 
        :error="!isNicknameAvailable"
        :hint="isNicknameAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'"
        />

        <!-- 공개 여부 -->
        <div class="d-flex align-center justify-space-between mt-4 mb-6">
          <span :style="{ color: isPublic ? '#4caf50' : '#aaa' }" class="text-caption">
            {{ isPublic ? '공개' : '비공개' }}
          </span>
          <v-switch v-model="isPublic" color="green" hide-details inset />
        </div>

        <v-btn
          block
          color="black"
          class="text-white font-weight-bold mb-4"
          height="44"
          :disabled="!passwordsMatch"
        >
          가입하기
        </v-btn>

        <div class="text-center text-caption">
          이미 계정이 있으신가요?
          <a href="#" class="font-weight-bold ml-1" @click.prevent="switchToLogin">로그인 하기</a>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'switch'])

const loginId = ref('');
const name = ref('');
const nickname = ref('');
const internalDialog = ref(true)
const isPublic = ref(true)

const email = ref('')
const verifyCode = ref('')
const isEmailVerified = ref(false)

const password = ref('')
const confirmPassword = ref('')

const isLoginIdAvailable = ref(true)
const isNicknameAvailable = ref(true)

let loginIdTimer = null
let nicknameTimer = null

const passwordsMatch = computed(() => {
  return password.value !== '' && password.value === confirmPassword.value
})

watch(loginId, (newId) => {
  clearTimeout(loginIdTimer)
  if (!newId) return
  loginIdTimer = setTimeout(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/auth/check-loginId', {
        params: { loginId: newId }
      })
      isLoginIdAvailable.value = res.data.data.available
    } catch (e) {
      isLoginIdAvailable.value = false
    }
  }, 500)
})

watch(nickname, (newName) => {
  clearTimeout(nicknameTimer)
  if (!newName) return
  nicknameTimer = setTimeout(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/auth/check-nickname', {
        params: { nickname: newName }
      })
      isNicknameAvailable.value = res.data.data.available
    } catch (e) {
      isNicknameAvailable.value = false
    }
  }, 500)
})

watch(internalDialog, (val) => {
  if (!val) emit('close')
})

async function sendEmailVerification() {
  if (!email.value) {
    alert('이메일을 입력하세요!')
    return
  }
  // 여기에 백엔드 SMTP 인증 요청 로직 들어갈 자리
  try {
    const res = await axios.post("http://localhost:8080/api/auth/email-verification-code", {
      email: email.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    alert(res.data.message);
  } catch (err) {
    if (err.response) {
    const status = err.response.data.status;
    const message = err.response.data.message;

    // 예시 조건 분기
    if (status === 409) {
        alert(message); // ❗ 예: "이미 가입된 이메일입니다."
      } else {
        alert("오류가 발생했습니다: " + message);
    }
    } else {
      alert("네트워크 오류가 발생했습니다.");
    }
  }
  console.log('이메일 인증 요청:', email.value)
}

async function sendVerificationCode() {
   // 여기에 백엔드 SMTP 인증 요청 로직 들어갈 자리
  try {
    const res = await axios.post("http://localhost:8080/api/auth/email-verification", {
      email: email.value,
      verificationCode: verifyCode.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    alert(res.data.message);
  } catch (err) {
    if (err.response) {
      const status = err.response.data.status;
      const message = err.response.data.message;

      if (status == 401) {
        alert(message);
      }
    } else {
      alert('네트워크 오류가 발생하였습니다!');
    }
  }
}

function switchToLogin() {
  internalDialog.value = false
  emit('switch')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
.text-green {
  color: #4caf50;
}
</style>