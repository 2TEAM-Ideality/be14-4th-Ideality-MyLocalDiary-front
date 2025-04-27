<template>
  <div class="d-flex pt-3 pb-5" style="gap:10px; align-items: center;">
    <v-textarea
      v-model="commentText"
      placeholder="댓글을 작성하세요..."
      rows="1"
      variant="outlined"
      hide-details
      auto-grow
    >
    </v-textarea>
    <v-btn 
      @click="handlePostComment" 
      color="primary" 
      class="comment-post-button"
      :disabled="!commentText.trim()"
    >
      <span style="color: white;">등록</span>
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const commentText = ref('');

// 댓글 작성 처리
const handlePostComment = () => {
  if (commentText.value.trim()) {
    // 댓글 작성 로직, 예: 서버에 전송하거나 로컬 상태에 추가
    console.log('작성된 댓글:', commentText.value);
    commentText.value = ''; // 입력 필드 초기화
  }
};
</script>

<style scoped>
</style>
