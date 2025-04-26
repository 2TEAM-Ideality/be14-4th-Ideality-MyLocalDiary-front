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
                        <div class="text-body-2 d-flex mb-2" style="gap: 20px; flex-direction: row;">
                            <div class="font-weight-medium text-body-2">{{ comment.username }}</div>
                            <div class="text-body-2 text-grey">{{ comment.timeAgo }}</div>
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
    </div>
</template>

<script setup>
import { ref } from 'vue'
import PostCommentCard from './PostCommentCard.vue'
import PostLikeIcon from './PostLikeIcon.vue'

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

    // 임시 더미
    const allReplies = [
    {
        id: '2',
        username: '_one____eno_',
        avatar: 'https://randomuser.me/api/portraits/women/20.jpg',
        text: '맨앞에 반팔셔츠는 공홈에 없나요?',
        timeAgo: '11시간 전',
        likeCount: 3,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 34,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 23,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 13,
        likedByCurrentUser: true
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 22,
        likedByCurrentUser: true
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 11,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 3,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 3,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 37,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 32,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 2,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 3,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 3,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 4,
        likedByCurrentUser: false
    },
    {
        id: '3',
        username: 'mmmm.d2',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        text: '여름 셔츠 발매는 언제인가요',
        timeAgo: '1일 전',
        likeCount: 34,
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
</script>