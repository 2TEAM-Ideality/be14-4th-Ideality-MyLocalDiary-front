<template>
    <div style="padding-bottom: 10px" :style="{ 'padding-left': isReply ? '32px' : '0' }">
        <v-card flat class="pl-2 pt-2 pb-0 d-flex flex-column" :class="isReply">
            <div class="d-flex" style="justify-content: space-between;">
                <div class="d-flex">
                    <!-- 프로필 아이콘 -->
                    <v-avatar size="32">
                        <v-img :src="comment.avatar" alt="Avatar" />
                    </v-avatar>
                    <div class="ml-2 flex-grow-1">
                        <!-- 닉네임, 작성시간 -->
                        <div class="d-flex" style="gap: 20px">
                            <div class="font-weight-medium text-body-2">{{ comment.username }}</div>
                            <div class="text-body-2 text-grey">{{ dayjs(comment.timeAgo).fromNow() }}</div>
                        </div>
                        <!-- 본문 -->
                        <div class="d-flex" style="justify-content: space-between;">
                            <div class="text-body-2">
                                {{ comment.text }}
                            </div>
                        </div>
                        <!-- 답글 달기 -->
                        <v-btn size="x-small" variant="text" class="mt-1" style="align-items: left; padding-left: 0px">
                            답글 달기
                        </v-btn>
                    </div>
                </div>
                <div class="d-flex" style="gap: 3px;">
                    <!-- <v-btn size="x-small" variant="text" class="text-body-2 text-grey" style="font-size:12px">
                        신고
                    </v-btn> -->
                    <v-menu
                        v-model="menuVisible"
                        :close-on-content-click="false"
                        offset-y
                    >
                        <template #activator="{ props }">
                            <v-btn
                            size="x-small"
                            variant="text"
                            class="text-body-2 text-grey"
                            style="font-size:12px"
                            v-bind="props"
                            >
                                <v-icon>mdi-dots-horizontal</v-icon>
                            </v-btn>
                        </template>
                        
                        <!-- 메뉴 항목들 -->
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
                    <!-- 좋아요 -->
                    <div style="justify-items: center;">
                        <!-- 좋아요 -->
                        <PostLikeIcon
                            :likedByCurrentUser="comment.likedByCurrentUser"
                            :likeCount="comment.likeCount"
                            @toggle="handleTogglecommentLike"
                        />
                    </div>
                </div>
            </div>

            <!-- 대댓글 -->
            <div v-if="showReplies" class="mt-2">
                <PostCommentCard
                v-for="reply in replies"
                :key="reply.id"
                :comment="reply"
                :is-reply="true"
                />
            </div>
        </v-card>
        <!-- 답글 더보기 / 숨기기 -->
        <div>
            <v-btn
                v-if="!isReply && hasMoreReplies"
                size="x-small"
                variant="text"
                class="mt-1"
                style="padding-left: 20px"
                @click="loadReplies"
            >
                --- 답글 더보기 ---
            </v-btn>

            <v-btn
                v-if="showReplies && !hasMoreReplies"
                size="x-small"
                variant="text"
                class="ml-8"
                style="padding-left: 20px"
                @click="hideReplies"
            >
                --- 답글 숨기기 ---
            </v-btn>
        </div>
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
import PostCommentCard from './PostCommentCard.vue'
import PostLikeIcon from './PostLikeIcon.vue'
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import ReportModal from '@/components/report/ReportModal.vue'

// 플러그인 확장
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
    })
    
    const showReplies = ref(false)
    const replies = ref([])
    const repliesPage = ref(1)
    const hasMoreReplies = ref(true)
    const reportDialog = ref(false) // 신고 모달

    // 임시 더미
    const allReplies = [
    {
        id: '2',
        username: '_one____eno_',
        avatar: 'https://randomuser.me/api/portraits/women/20.jpg',
        text: '맨앞에 반팔셔츠는 공홈에 없나요?',
        timeAgo: '2025-04-28T12:52:00+09:00',
        likeCount: 3,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '2025-04-21T12:00:00+09:00',
        likeCount: 34,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '2025-04-28T13:54:00+09:00',
        likeCount: 23,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '2025-03-28T12:00:00+09:00',
        likeCount: 13,
        likedByCurrentUser: true
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '2025-04-23T12:00:00+09:00',
        likeCount: 22,
        likedByCurrentUser: true
    },
    ]

    const pageSize = 5
    const loadReplies = async () => {
        showReplies.value = true
        // 예시 API 호출 → 실제 API에 맞게 수정
        // const res = await fetch(`/api/comments/${props.comment.id}/replies`)
        // replies.value = await res.json()
        const start = (repliesPage.value - 1) * pageSize
        const end = repliesPage.value * pageSize
        const nextBatch = allReplies.slice(start,end)

        if(nextBatch.length === 0) {
            hasMoreReplies.value = false
            return
        }
        replies.value.push(...nextBatch)
        repliesPage.value++;
    }

    const hideReplies = () => {
        showReplies.value = false
        replies.value = []
        repliesPage.value = 1
        hasMoreReplies.value = true
    }
    
    const handleTogglecommentLike = () => {
    if (props.comment.likedByCurrentUser) {
        props.comment.likeCount -= 1
    } else {
        props.comment.likeCount += 1
    }
    props.comment.likedByCurrentUser = !props.comment.likedByCurrentUser
    }

    const menuVisible = ref(false);
    const confirmDialog = ref(false)
    // 해당 댓글 id에 대하여
    function handleEdit() {
        console.log("수정 클릭");
        // 수정 로직 처리
    }

    function handleReport() {
        console.log("신고 클릭");
        // 신고 로직 처리
        reportDialog.value = true 


    }

    function handleCloseMenu() {
        menuVisible.value = false;
        console.log("닫기 클릭");
        // 메뉴 닫기
    }

    function deleteItem() {
        confirmDialog.value = false
        console.log('삭제 실행!')
        // 여기에 실제 삭제 로직
    }

    function confirmDelete() {
        menuVisible.value = false
        confirmDialog.value = true
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