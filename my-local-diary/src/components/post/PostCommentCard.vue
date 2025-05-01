<template>
    <div style="padding-bottom: 10px" :style="{ 'padding-left': isReply ? '32px' : '0' }">
        <v-card flat class="pl-2 pt-2 pb-0 d-flex flex-column" :class="isReply">
            <div class="d-flex" style="justify-content: space-between;">
                <div class="d-flex">
                    <v-avatar size="32">
                        <v-img :src="comment.avatar" alt="Avatar" />
                    </v-avatar>
                <div class="ml-2 flex-grow-1">
                    <div class="d-flex" style="gap: 20px">
                        <div class="font-weight-medium text-body-2">{{ comment.username }}</div>
                        <div class="text-body-2 text-grey">{{ dayjs(comment.timeAgo).fromNow() }}</div>
                    </div>
                    <div class="d-flex" style="justify-content: space-between;">
                        <div class="text-body-2">
                            {{ comment.text }}
                        </div>
                    </div>
                    <v-btn size="x-small" variant="text" class="mt-1" style="align-items: left; padding-left: 0px" @click="loadReplies">
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
                        <v-list-item @click="handleEdit" class="menu-item">
                            <v-list-item-title class="menu-list">수정</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="confirmDelete" class="menu-item">
                            <v-list-item-title class="menu-list">삭제</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="handleReport" class="menu-item">
                            <v-list-item-title class="menu-list">신고</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="handleCloseMenu" class="menu-item">
                            <v-list-item-title class="menu-list">닫기</v-list-item-title>
                        </v-list-item>
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
            <div style="justify-items: center;">
              <PostLikeIcon :likedByCurrentUser="comment.likedByCurrentUser" :likeCount="comment.likeCount" @toggle="handleTogglecommentLike" />
            </div>
          </div>
        </div>
        <div v-if="showReplies" class="mt-2">
          <PostCommentCard v-for="reply in replies" :key="reply.commentId" :comment="reply" :is-reply="true" />
        </div>
      </v-card>
      <div>
        <v-btn v-if="!isReply && hasMoreReplies && !showReplies" size="x-small" variant="text" class="mt-1" style="padding-left: 20px" @click="loadReplies">
          --- 답글 더보기 ---
        </v-btn>
        <v-btn v-if="showReplies && !hasMoreReplies" size="x-small" variant="text" class="ml-8" style="padding-left: 20px" @click="hideReplies">
          --- 답글 숨기기 ---
        </v-btn>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import PostCommentCard from './PostCommentCard.vue'
  import PostLikeIcon from './PostLikeIcon.vue'
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import 'dayjs/locale/ko';
  
  dayjs.extend(relativeTime);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.locale('ko');
  
  const props = defineProps({
    comment: Object,
    isReply: {
      type: Boolean,
      default: false
    }
  });
  
  const showReplies = ref(false)
  const replies = ref([])
  const repliesPage = ref(1)
  const hasMoreReplies = ref(true)
  
  const pageSize = 5;
  const loadReplies = async () => {
    try {
        console.log('📌 대댓글 parentCommentId:', props.comment.id);

        const res = await axios.get('/api/posts/replies', {
            params: { parentCommentId: props.comment.id }
        });
  
      replies.value = res.data.map(r => ({
        commentId: r.commentId,
        username: r.nickname,
        avatar: r.profileImage,
        text: r.content,
        timeAgo: r.createdAt,
        likeCount: r.likeCount,
        likedByCurrentUser: r.likedByCurrentUser
      }));
  
      showReplies.value = true;
      hasMoreReplies.value = false;
    } catch (e) {
      console.error('❌ 대댓글 불러오기 실패:', e);
    }
  };
  
  const hideReplies = () => {
    showReplies.value = false;
    replies.value = [];
    repliesPage.value = 1;
    hasMoreReplies.value = true;
  };
  
  const handleTogglecommentLike = () => {
    if (props.comment.likedByCurrentUser) {
      props.comment.likeCount -= 1;
    } else {
      props.comment.likeCount += 1;
    }
    props.comment.likedByCurrentUser = !props.comment.likedByCurrentUser;
  };
  
  const menuVisible = ref(false);
  const confirmDialog = ref(false);
  function handleEdit() { console.log('수정 클릭'); }
  function handleReport() { console.log('신고 클릭'); }
  function handleCloseMenu() { menuVisible.value = false; }
  function deleteItem() {
    confirmDialog.value = false;
    console.log('삭제 실행!');
  }
  function confirmDelete() {
    menuVisible.value = false;
    confirmDialog.value = true;
  }
  </script>
  
  <style scoped>
  .menu-list { font-size: 12px; }
  .menu-item { display: flex; min-height: 30px; }
  </style>
  