<template>
  <div class="box">
    <h2 class="text-h5 font-weight-bold text-center mb-8" style="color: #ff6666">
      {{ currentStep === 'verify' ? '비밀번호 재확인' : '개인 정보 설정' }}
    </h2>

    <!-- 1단계: 비밀번호 재확인 -->
    <div v-if="currentStep === 'verify'">
      <v-text-field label="아이디" v-model="form.id" readonly />
      <v-text-field label="비밀번호" v-model="form.password" type="password" />
      <v-btn block color="black" class="mt-4" @click="verifyPassword">확인</v-btn>
    </div>

    <!-- 2단계: 개인정보 설정 -->
    <div v-else>
      <v-text-field label="아이디" v-model="form.id" readonly />
      <v-text-field label="이메일" v-model="form.email" />

      <!-- 비밀번호 변경 -->
      <div class="d-flex align-center justify-space-between my-4">
        <v-text-field
            label="비밀번호"
            :type="showOriginalPassword ? 'text' : 'password'"
            v-model="form.password"
            style="flex: 1"
            :append-icon="showOriginalPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="showOriginalPassword = !showOriginalPassword"
        />
        <!-- disabled -->

        <v-btn color="black" class="ml-4" @click="togglePasswordEdit">
          {{ showPasswordEdit ? '취소' : '비밀번호 변경' }}
        </v-btn>
      </div>

      <!-- 변경 입력창 -->
      <div v-if="showPasswordEdit" class="mt-2">
        <v-text-field
        label="새 비밀번호"
        :type="showNewPassword ? 'text' : 'password'"
        v-model="newPassword"
        :append-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append="showNewPassword = !showNewPassword"
        :error-messages="passwordErrors.new ? [passwordErrors.new] : []"
        />

        <v-text-field
        label="새 비밀번호 확인"
        :type="showConfirmPassword ? 'text' : 'password'"
        v-model="confirmPassword"
        :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append="showConfirmPassword = !showConfirmPassword"
        :error-messages="passwordErrors.confirm ? [passwordErrors.confirm] : []"
        />
      </div>

      <v-btn block color="black" class="mt-4" @click="submitChanges">
        개인 정보 설정 완료
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  user: Object
})

const currentStep = ref('verify')
const showOriginalPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)


const form = ref({
  id: '',
  email: '',
  password: ''
})

const showPasswordEdit = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordErrors = ref({ new: '', confirm: '' })

watch(
  () => props.user,
  (val) => {
    if (val) {
      form.value.id = val.login_id
      form.value.email = val.email
    }
  },
  { immediate: true }
)

// ✅ 비밀번호 입력 도중 자동 검증
watch([newPassword, confirmPassword], ([newVal, confirmVal]) => {
  passwordErrors.value.new = ''
  passwordErrors.value.confirm = ''

  if (showPasswordEdit.value) {
    if (newVal && confirmVal && newVal !== confirmVal) {
      passwordErrors.value.confirm = '비밀번호가 일치하지 않습니다.'
    }
  }
})

const verifyPassword = () => {
  if (form.value.password === 'pass01') {
    currentStep.value = 'edit'
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
}

const togglePasswordEdit = () => {
  showPasswordEdit.value = !showPasswordEdit.value
  newPassword.value = ''
  confirmPassword.value = ''
  passwordErrors.value = { new: '', confirm: '' }
}

const submitChanges = () => {
  passwordErrors.value = { new: '', confirm: '' }

  if (showPasswordEdit.value && (!newPassword.value || newPassword.value !== confirmPassword.value)) {
    if (!newPassword.value) passwordErrors.value.new = '새 비밀번호를 입력해주세요.'
    if (newPassword.value !== confirmPassword.value)
      passwordErrors.value.confirm = '비밀번호가 일치하지 않습니다.'
    return
  }

  const updated = {
    id: form.value.id,
    email: form.value.email,
    new_password: showPasswordEdit.value ? newPassword.value : null
  }

  console.log('저장된 정보:', updated)
  alert('개인정보 설정이 완료되었습니다!')
}
</script>


<style scoped>
.box {
  padding: 8% 12%;
}
</style>
