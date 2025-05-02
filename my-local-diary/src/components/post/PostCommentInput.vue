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
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const commentText = ref('')
const props = defineProps({
  postId: Number
})

const emit = defineEmits(['refreshComments'])

const handlePostComment = async () => {
  const trimmed = commentText.value.trim()
  if (!trimmed) return

  try {
    await axios.post('/api/comments', {
      content: trimmed,
      postId: props.postId,
      memberId: userStore.id,
      parentCommentId: null, // 대댓글이 아닌 경우
      targetMemberId: null   // 멘션 등의 대상이 없을 경우
    })

    // 등록 후 초기화 및 추가 작업 (댓글 목록 갱신 등)
    commentText.value = ''
    console.log('✅ 댓글 등록 성공')
    // 예: emit('refreshComments') 등
    emit('refreshComments')
  } catch (err) {
    console.error('❌ 댓글 등록 실패:', err)
  }
}
</script>


<style scoped>
</style>
