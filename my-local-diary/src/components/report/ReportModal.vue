<template>
  <div class="common-report">
    <v-dialog v-model="dialog" max-width="600" class="custom-dialog">
      <v-card class="custom-card">
        <v-card-text class="custom-card-text">

          <!-- 고양이 이미지 -->
          <div class="report-header-inside">
            <img :src="reportImg" alt="신고하기 고양이" class="report-img-inside" />
          </div>

          <!-- 신고사유 입력 박스 -->
          <v-textarea
            v-model="reason"
            label="신고사유를 자세히 적어서 제출하십시오."
            solo
            auto-grow
            rows="5"
            class="custom-textarea"
          ></v-textarea>

          <!-- 제출 버튼 -->
          <div class="button-wrapper">
            <v-btn
              :disabled="reason.length < 10"
              class="custom-submit-btn"
              @click="submitReport"
            >
              제출하기
            </v-btn>
          </div>

        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import reportImg from '@/assets/report/report.svg'

const dialog = ref(true)
const reason = ref('')

const submitReport = () => {
  console.log('신고 내용:', reason.value)
  reason.value = ''
}
</script>

<style scoped>
/* 전체 레이아웃 */
.common-report {
  font-family: sans-serif;
  margin: 20px;
}

/* 모달 기본 */
.custom-dialog {
  padding: 20px;
}

/* 카드 스타일 */
.custom-card {
  padding: 20px;
  border-radius: 0;
}

/* 텍스트 박스 & 버튼 감싸는 영역 */
.custom-card-text {
  margin-top: 0;
  padding-top: 8px; /* ✅ 위쪽 패딩 줄이기 */
  padding-bottom: 0;
}

/* 고양이 헤더 */
.report-header-inside {
  display: flex;
  justify-content: flex-start;
}

/* 고양이 이미지 스타일 */
.report-img-inside {
  height: 80px;
  width: 200px;
  position: relative;
  left: -10px;
}

/* 텍스트 박스 스타일 */
.custom-textarea {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

/* 버튼 감싸는 영역 */
.button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.custom-submit-btn {
  background-color: #5c6bc0; /* 👉 여기 자주 쓰는 색으로 변경할 거야 */
  color: #FFFFFF; /* ✅ 버튼 글자색을 흰색으로 */
  font-weight: bold;
  border-radius: 8px;
  height: 24px !important; /* 세로 높이 줄이기 */
  min-width: 140px; /* 가로 넓히기 */
  font-size: 14px; /* 버튼 글자도 약간 키우기 */
}

/* 비활성화 상태 */
.custom-submit-btn:disabled {
  background-color: #D9D9D9;
  color: #FFFFFF; /* ✅ 버튼 글자색을 흰색으로 */
}


/* textarea 내부 스타일 정리 */
::v-deep(.v-input__control) {
  background-color: #f5f5f5;
  border: none !important;
  box-shadow: none !important;
  border-radius: 8px;
}

/* 포커스 시에도 변화 없음 */
::v-deep(.v-input--focused .v-input__control),
::v-deep(.v-field--focused) {
  background-color: #f5f5f5 !important;
  border: none !important;
  box-shadow: none !important;
}

/* 라벨 폰트 크기 */
::v-deep(.v-field-label) {
  font-size: 13px;
}

/* 아웃라인 없애기 */
::v-deep(.v-field__outline) {
  display: none;
}
</style>
