<template>
  <div style="padding-bottom: 10px" :style="{ 'padding-left': isReply ? '32px' : '0' }">
    <v-card flat class="pl-2 pt-2 pb-0 d-flex flex-column">
      <div class="d-flex justify-space-between">
        <div class="d-flex">
          <v-avatar size="32">
            <v-img :src="comment.avatar" alt="Avatar" />
          </v-avatar>
          <div class="ml-2 flex-grow-1">
            <div class="d-flex" style="gap: 20px">
              <div class="font-weight-medium text-body-2">{{ comment.username }}</div>
              <div class="text-body-2 text-grey">{{ dayjs(comment.timeAgo).fromNow() }}</div>
            </div>
            <div class="text-body-2">{{ comment.text }}</div>
            <v-btn size="x-small" variant="text" class="mt-1 pl-0" @click="loadReplies" v-if="!isReply">
              답글 달기
            </v-btn>
          </div>
        </div>
        <div class="d-flex" style="gap: 3px;">
          <v-menu v-model="menuVisible" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-btn size="x-small" variant="text" class="text-body-2 text-grey" style="font-size:12px" v-bind="props">
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>
            <v-list dense style="padding: 0; margin: 0;">
              <v-list-item @click="handleEdit"><v-list-item-title class="menu-list">수정</v-list-item-title></v-list-item>
              <v-list-item @click="confirmDelete"><v-list-item-title class="menu-list">삭제</v-list-item-title></v-list-item>
              <v-list-item @click="handleReport"><v-list-item-title class="menu-list">신고</v-list-item-title></v-list-item>
              <v-list-item @click="handleCloseMenu"><v-list-item-title class="menu-list">닫기</v-list-item-title></v-list-item>
            </v-list>
          </v-menu>
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
        </div>
      </div>

      <div style="justify-items: center;">
        <PostLikeIcon :likedByCurrentUser="comment.likedByCurrentUser" :likeCount="comment.likeCount" @toggle="handleToggleCommentLike" />
      </div>

      <div v-if="showReplies" class="mt-2">
        <PostCommentCard
          v-for="reply in replies"
          :key="reply.commentId"
          :comment="reply"
          :is-reply="true"
        />
      </div>
    </v-card>

    <!-- 답글 더보기/숨기기 버튼 -->
    <div>
      <v-btn v-if="!isReply && hasMoreReplies && !showReplies" size="x-small" variant="text" class="mt-1 pl-5" @click="loadReplies">
        --- 답글 더보기 ---
      </v-btn>
      <v-btn v-if="showReplies && !hasMoreReplies" size="x-small" variant="text" class="ml-8 pl-5" @click="hideReplies">
        --- 답글 숨기기 ---
      </v-btn>
    </div>

    <!-- 신고 모달 -->
    <ReportModal
      :type="'COMMENT'"
      :reported-id="comment.id"
      :modelValue="reportDialog"
      @update:modelValue="reportDialog = $event"
      @close="reportDialog = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

import PostCommentCard from './PostCommentCard.vue'
import PostLikeIcon from './PostLikeIcon.vue'
import ReportModal from '@/components/report/ReportModal.vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ko')

const props = defineProps({
  comment: Object,
  isReply: {
    type: Boolean,
    default: false
  }
})

const menuVisible = ref(false)
const confirmDialog = ref(false)
const reportDialog = ref(false)

function handleEdit() {
  console.log('수정 클릭')
}
function confirmDelete() {
  menuVisible.value = false
  confirmDialog.value = true
}
function deleteItem() {
  confirmDialog.value = false
  console.log('삭제 실행!')
}
function handleReport() {
  reportDialog.value = true
}
function handleCloseMenu() {
  menuVisible.value = false
}

const handleToggleCommentLike = async () => {
  try {
    const url = props.comment.likedByCurrentUser
      ? '/api/posts/comment/unlike'
      : '/api/posts/comment/like'

    await axios.post(url, null, {
      params: { commentId: props.comment.id, memberId: userStore.id }
    })

    props.comment.likeCount += props.comment.likedByCurrentUser ? -1 : 1
    props.comment.likedByCurrentUser = !props.comment.likedByCurrentUser
  } catch (err) {
    console.error('❌ 댓글 좋아요 토글 실패:', err)
  }
}

// 답글 로딩
const showReplies = ref(false)
const replies = ref([])
const repliesPage = ref(1)
const hasMoreReplies = ref(true)
const pageSize = 5

const loadReplies = async () => {
  try {
    const res = await axios.get('/api/posts/replies', {
      params: { parentCommentId: props.comment.id }
    })

    replies.value = res.data.map(r => ({
      commentId: r.commentId,
      username: r.nickname,
      avatar: r.profileImage,
      text: r.content,
      timeAgo: r.createdAt,
      likeCount: r.likeCount,
      likedByCurrentUser: r.likedByCurrentUser
    }))

    showReplies.value = true
    hasMoreReplies.value = false
  } catch (err) {
    console.error('❌ 대댓글 불러오기 실패:', err)
  }
}

const hideReplies = () => {
  showReplies.value = false
  replies.value = []
  repliesPage.value = 1
  hasMoreReplies.value = true
}
</script>

<style scoped>
.menu-list {
  font-size: 12px;
}
.menu-item {
  display: flex;
  min-height: 30px;
}
</style>
