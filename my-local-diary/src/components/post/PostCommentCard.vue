<template>
  <div style="padding-bottom: 10px" :style="{ 'padding-left': isReply ? '32px' : '0' }">
    <v-card flat class="pl-2 pt-2 pb-0 d-flex flex-column">
      <v-card flat class="pl-2 pt-2 pb-0 d-flex flex-column">
  <!-- 1. 아바타 + 유저명 + 작성 시간 -->
  <div class="d-flex align-center" style="gap: 8px;">
    <v-avatar size="32">
      <v-img :src="comment.avatar" alt="Avatar" />
    </v-avatar>
    <div class="font-weight-medium text-body-2">{{ comment.username }}</div>
    <div class="text-body-2 text-grey">{{ dayjs(comment.timeAgo).fromNow() }}</div>
  </div>

  <!-- 2. 댓글 + 좋아요 + 메뉴 (한 줄) -->
  <div class="d-flex justify-space-between align-center mt-1">
    <!-- 왼쪽: 댓글 텍스트 -->
    <div class="text-body-2">{{ comment.text }}</div>

    <!-- 오른쪽: 좋아요 + 수 + 메뉴 -->
    <div class="d-flex align-center" style="gap: 6px;">
      <PostLikeIcon
        :likedByCurrentUser="comment.likedByCurrentUser"
        @toggle="handleToggleCommentLike"
        style="margin: 0; padding: 0;"
      />
      <div class="text-body-2">{{ comment.likeCount }}</div>

      <v-menu v-model="menuVisible" :close-on-content-click="false" offset-y>
        <template #activator="{ props }">
          <v-btn icon size="x-small" v-bind="props">
            <v-icon small>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="handleEdit"><v-list-item-title>수정</v-list-item-title></v-list-item>
          <v-list-item @click="confirmDelete"><v-list-item-title>삭제</v-list-item-title></v-list-item>
          <v-list-item @click="handleReport"><v-list-item-title>신고</v-list-item-title></v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</v-card>

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
    });

    // 댓글마다 좋아요 여부 별도 요청
    const repliesWithLikeStatus = await Promise.all(
      res.data.map(async r => {
        const likeCheckRes = await axios.get('/api/posts/comment/like/check', {
          params: { commentId: r.commentId, memberId: userStore.id }
        });
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅")
        console.log(likeCheckRes)
        return {
          commentId: r.commentId,
          username: r.nickname,
          avatar: r.profileImage,
          text: r.content,
          timeAgo: r.createdAt,
          likeCount: r.likeCount,
          likedByCurrentUser: likeCheckRes.data
        };
      })
    );

  replies.value = repliesWithLikeStatus.map(r => ({
  id: r.commentId, // <-- 이걸 추가
  username: r.username,
  avatar: r.avatar,
  text: r.text,
  timeAgo: r.timeAgo,
  likeCount: r.likeCount,
  likedByCurrentUser: r.likedByCurrentUser
}));

    showReplies.value = true;
    hasMoreReplies.value = false;
  } catch (err) {
    console.error('❌ 대댓글 불러오기 실패:', err);
  }
};


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
