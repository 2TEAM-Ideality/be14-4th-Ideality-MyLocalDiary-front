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
              :disabled="isEmailVerificationSent"
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
            :color="isVerificationCodeValid ? 'pink-lighten-4' : 'grey'"
            variant="flat"
            :disabled="!isVerificationCodeValid"
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

        <v-text-field
          v-model="birth"
          label="생년월일"
          variant="outlined"
          dense
          class="mb-3"
          type="date"
        />
        <v-text-field v-model.lazy = "nickname" 
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
          :disabled="!isFormValid"
          @click="signup"
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

const loginId = ref('')
const name = ref('')
const nickname = ref('')
const birth = ref('')
const internalDialog = ref(true)
const isPublic = ref(true)

const email = ref('')
const verifyCode = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoginIdAvailable = ref(true)
const isNicknameAvailable = ref(true)

const isEmailVerificationSent = ref(false)
const isVerificationCodeValid = ref(false)

const isAuthenticated = ref(false)

let loginIdTimer = null
let nicknameTimer = null

const passwordsMatch = computed(() => {
  return password.value !== '' && password.value === confirmPassword.value
})

// 로그인 아이디 중복 체크
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

// 닉네임 중복 체크
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

// 인증번호 길이 감시
watch(verifyCode, (code) => {
  isVerificationCodeValid.value = code.length === 6
})

// 다이얼로그 닫기 이벤트 처리
watch(internalDialog, (val) => {
  if (!val) emit('close')
})

async function sendEmailVerification() {
  if (!email.value) {
    alert('📧 이메일을 입력해주세요.');
    return;
  }

  try {
    const res = await axios.post("http://localhost:8080/api/auth/email-verification-code", {
      email: email.value
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    alert(res.data.message); // ex. "인증 코드가 발송되었습니다."
    isEmailVerificationSent.value = true;
    verifyCode.value = '';
    isVerificationCodeValid.value = false;
  } catch (err) {
    const message = err?.response?.data?.message || '네트워크 오류가 발생했습니다.';
    
    if (err?.response?.status === 409 && message === '이미 사용중인 이메일입니다.') {
      alert('🚫 이미 가입된 이메일입니다.');
    } else {
      alert('❗ 오류: ' + message);
    }
  }
}

async function sendVerificationCode() {
  if (!verifyCode.value) {
    alert('✅ 인증 코드를 입력해주세요.');
    return;
  }

  try {
    const res = await axios.post("http://localhost:8080/api/auth/email-verification", {
      email: email.value,
      verificationCode: verifyCode.value
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    alert(res.data.message); // ex. "이메일 인증이 완료되었습니다."
    isVerificationCodeValid.value = false;
    isAuthenticated.value = true;
  } catch (err) {
    const message = err?.response?.data?.message || '네트워크 오류가 발생했습니다.';

    switch (message) {
      case '인증 번호가 만료되었습니다.':
        alert('⏰ 인증 번호가 만료되었습니다. 다시 요청해주세요.');
        break;
      case '인증되지 않는 이메일입니다.':
        alert('⚠️ 이메일 인증을 먼저 진행해주세요.');
        break;
      default:
        alert('❗ 인증 실패: ' + message);
    }
  }
}



const isFormValid = computed(() => {
  return (
    loginId.value &&
    email.value &&
    verifyCode.value &&
    password.value &&
    confirmPassword.value &&
    name.value &&
    birth.value &&
    nickname.value &&
    passwordsMatch.value &&
    isLoginIdAvailable.value &&
    isNicknameAvailable.value &&
    isAuthenticated
  )
})

async function signup() {
  try {
    const res = await axios.post("http://localhost:8080/api/auth/signup", {
      loginId: loginId.value,
      email: email.value,
      password: password.value,
      name: name.value,
      nickname: nickname.value,
      birth: birth.value,
      isPublic: isPublic.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    alert('🎉 회원가입이 완료되었습니다!');
    internalDialog.value = false; // 다이얼로그 닫기
    emit('switch'); // 로그인 화면으로 전환
  } catch (err) {
    const message = err?.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
    alert('❗ ' + message);
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