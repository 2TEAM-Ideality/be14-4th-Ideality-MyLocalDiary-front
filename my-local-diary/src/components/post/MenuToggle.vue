<template>
    <div class="relative">
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        offset-y
      >
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            class="dots-button"
            size="small"
          >
            <v-icon size="20">mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
  
        <v-list>
          <v-list-item @click="onAction('Edit')">
            <v-list-item-title>수정</v-list-item-title>
            <!-- 수정 페이지로 이동 -->
          </v-list-item>
          <v-list-item @click="confirmDelete">
            <v-list-item-title>삭제</v-list-item-title>
            <!-- 삭제 확인 토글 -->
          </v-list-item>
          <v-list-item @click="onAction('Report')">
            <v-list-item-title>신고</v-list-item-title>
            <!-- 신고 토글 -->
          </v-list-item>
          <v-list-item @click="onClose">
            <v-list-item-title>닫기</v-list-item-title>
            <!-- 수정 페이지로 이동 -->
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- 삭제 확인 다이얼로그 -->
      <v-dialog v-model="confirmDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h6">삭제 확인</v-card-title>
          <v-card-text>정말 삭제하시겠습니까?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="deleteItem">삭제</v-btn>
            <v-btn color="grey" text @click="confirmDialog = false">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <ReportModal
        v-if="reportDialog"
        :type="props.type"
        :reported-id="props.reportedId"
        :modelValue="reportDialog"
        @update:modelValue="reportDialog = $event"
        @close="reportDialog = false"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import ReportModal from '@/components/report/ReportModal.vue'

  const props = defineProps({
    modelValue: Boolean,
    type: String, // 'POST' | 'COMMENT' | 'MEMBER'
    reportedId: [Number, String]
  })


  
  const menu = ref(false)
  const confirmDialog = ref(false)
  const reportDialog = ref(false)

  function onAction(action) {
    menu.value = false
    if (action === 'Report') {
    reportDialog.value = true // 신고 모달 열기!
    } else {
      console.log('Selected action:', action)
    }
  }

  function onClose() {
    menu.value = false
  }

  function confirmDelete() {
    menu.value = false
    confirmDialog.value = true
  }

  function deleteItem() {
    confirmDialog.value = false
    console.log('삭제 실행!')
    // 여기에 실제 삭제 로직
  }
  </script>
  
  <style scoped>
  .dots-button {
    background: transparent !important;
    box-shadow: none !important;
    min-width: 0;
  }

  .v-list {
    justify-items: center;
    padding: 0;
  }
  .v-list-item-title {
    padding: 0;
  }
  </style>
  