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
        <v-text-field label="아이디" variant="outlined" dense class="mb-3" />

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

        <v-text-field label="이름" variant="outlined" dense class="mb-3" />
        <v-text-field label="닉네임" variant="outlined" dense class="mb-3" />

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

const emit = defineEmits(['close', 'switch'])

const internalDialog = ref(true)
const isPublic = ref(true)

const email = ref('')
const verifyCode = ref('')
const isEmailVerified = ref(false)

const password = ref('')
const confirmPassword = ref('')

const passwordsMatch = computed(() => {
  return password.value !== '' && password.value === confirmPassword.value
})

watch(internalDialog, (val) => {
  if (!val) emit('close')
})

function sendEmailVerification() {
  if (!email.value) {
    alert('이메일을 입력하세요!')
    return
  }
  // 여기에 백엔드 SMTP 인증 요청 로직 들어갈 자리
  console.log('이메일 인증 요청:', email.value)

  // 예시로 성공했다고 처리
  setTimeout(() => {
    isEmailVerified.value = true
    alert('인증 메일이 전송되었습니다!')
  }, 500)
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