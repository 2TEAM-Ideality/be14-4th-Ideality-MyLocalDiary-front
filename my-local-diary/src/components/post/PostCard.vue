<template>
  <div style="display: flex; height: 80vh; overflow: hidden">
    <!-- 왼쪽: 이미지 -->
    <div
      class="left-pane d-flex align-center justify-center"
      style="flex: 5.6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); overflow-y: auto"
    >
      <PostPhoto :images="photoList" />
    </div>

    <!-- 오른쪽: 본문 및 댓글 -->
    <div
      class="right-pane d-flex"
      style="flex: 4.4; flex-direction: column; padding: 30px; position: relative; min-width: 0; max-width: 100%"
    >
      <div
        ref="scrollArea"
        class="flex-grow-1 overflow-y-scroll pr-4 pt-4"
        @scroll="onScroll"
      >
        <div class="d-flex justify-space-between">
          <PostAuthorCard :author="author" />
          <MenuToggle :type="'POST'" :reported-id="props.postId" />
        </div>

        <!-- 게시글 제목 -->
        <div class="pt-2">
          <hr />
          <h3>{{ postTitle }}</h3>
          <hr />
        </div>
        <!-- 여기 마커 추가 -->
         <!-- 장소 마커 리스트 (가로 스크롤) -->
<div
  v-if="placeList.length"
  class="d-flex"
  style="gap: 4px; overflow-x: auto; padding-bottom: 4px;"
>
  <PostMarker
    v-for="place in placeList"
    :key="place.id"
    :image="place.url"
    :name="place.name"
    :post_id="place.post_id"
    @click="handleMarkerClick"
  />
</div>

        <div
          v-if="isMine"
          class="d-inline-flex align-center rounded-pill px-3 py-1 mb-2"
          style="background-color: #fecccc; font-size: 14px; margin-top: 4px"
        >
          <span @click="postType = 'post'" :class="postType === 'post' ? 'text-black' : 'text-grey-darken-1'" class="cursor-pointer" style="margin-right: 6px;">Post</span>
          <span class="text-grey-darken-2">|</span>
          <span @click="postType = 'diary'" :class="postType === 'diary' ? 'text-black' : 'text-grey-darken-1'" class="cursor-pointer" style="margin-left: 6px;">Diary</span>
        </div>

        <div class="pb-5">
          <PostContentCard :content="postType === 'post' ? postContent : diaryContent" />
        </div>

        <!-- 좋아요/댓글 영역 -->
        <div class="d-flex" style="gap: 10px; align-items: center;">
          <!-- 좋아요 -->
          <PostLikeIcon
            :likedByCurrentUser="postLikedByCurrentUser"
            :likeCount="postLikeCount"
            @toggle="handleTogglePostLike"
          />
          <!-- 댓글 수 -->
          <v-icon size="32" style="justify-content: center; align-content: center;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 19C11.78 19 13.5201 18.4722 15.0001 17.4832C16.4802 16.4943 17.6337 15.0887 18.3149 13.4442C18.9961 11.7996 19.1743 9.99002 18.8271 8.24419C18.4798 6.49836 17.6226 4.89472 16.364 3.63604C15.1053 2.37737 13.5016 1.5202 11.7558 1.17294C10.01 0.82567 8.20038 1.0039 6.55585 1.68509C4.91131 2.36628 3.50571 3.51983 2.51677 4.99987C1.52784 6.47991 1 8.21997 1 10C1 11.488 1.36 12.891 2 14.127L1 19L5.873 18C7.109 18.64 8.513 19 10 19Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </v-icon>
          <div>
              {{ commentCount }}
          </div>
        </div>

        <div style="font-size: 14px; color: grey">{{ createdAt }}</div>
        <v-divider class="my-3" />

        <!-- 댓글 목록 -->
        <div class="comment-container">
          <PostCommentCard v-for="comment in displayedComments" :key="comment.id" :comment="comment" />
        </div>
      </div>

      <!-- 스크롤 위로 버튼 -->
      <button v-show="scrollPosition > 300" @click="scrollToTop" style="position: absolute; bottom: 60px; right: 30px;">↑</button>

      <v-divider class="my-3" />
      <PostCommentInput />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useRoute } from 'vue-router';

import PostAuthorCard from './PostAuthorCard.vue';
import PostContentCard from '@/components/post/PostContentCard.vue';
import PostCommentCard from './PostCommentCard.vue';
import PostPhoto from '@/components/post/PostPhoto.vue';
import PostLikeIcon from './PostLikeIcon.vue';
import PostCommentInput from './PostCommentInput.vue';
import MenuToggle from './MenuToggle.vue';
import PostMarker from '../common/PostMarker.vue';


const props = defineProps({
  postId: Number,
  memberId: Number
});

const userStore = useUserStore();
const route = useRoute();

const routeUserId = computed(() => {
  return route.params.id ? Number(route.params.id) : userStore.id;
});

const author = ref({});
const postTitle = ref('');
const postContent = ref('');
const diaryContent = ref('');
const createdAt = ref('');
const photoList = ref([]);
const placeList = ref([]);

const postLikeCount = ref(0);
const postLikedByCurrentUser = ref();
const isMine = ref(false);

const comments = ref([]);
const commentCount = ref(0);
const displayedComments = ref([]);
const pageSize = 5;
let currentPage = 0;
const isLoading = ref(false);
const scrollArea = ref(null);
const scrollPosition = ref(0);
const postType = ref('post');

const fetchPostDetail = async () => {
  try {
    const isMyPost = Number(route.params.id) === userStore.id;
    const url = isMyPost
      ? `/api/posts/my/${props.postId}`
      : `/api/posts/follow/${props.postId}`;

    const res = await axios.get(url, {
      params: { memberId: userStore.id },
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });

    const data = res.data;

    isMine.value = isMyPost;
    author.value = { name: data.nickname, avatar: data.profileImage };
    postTitle.value = data.title;
    postContent.value = data.post;
    diaryContent.value = data.diary;
    createdAt.value = data.createdAt;

    placeList.value = Array.isArray(data.places)
      ? data.places.map(p=>({
        id:p.id,
        name: p.name,
        url: p.thumbnailImage,
        orders: p.orders
      })): [];

    photoList.value = Array.isArray(data.photos)
      ? data.photos.map(p => ({
          id: p.id,
          url: p.imageUrl,
          orders: p.orders,
          post_id: data.postId
        }))
      : [];
    postLikeCount.value = data.likes;
    postLikedByCurrentUser.value = data.likedByCurrentUser;
  } catch (err) {
    console.error('❌ fetchPostDetail 실패:', err);
  }
};

const checkPostLikeStatus = async () => {
  try {
    const res = await axios.get('/api/posts/like/check', {
      params: { postId: props.postId, memberId: props.memberId }
    });
    postLikedByCurrentUser.value = res.data;
  } catch (err) {
    console.error('❌ 좋아요 여부 확인 실패:', err);
  }
};


const fetchComments = async () => {
  try {
    const res = await axios.get('/api/posts/comments', {
      params: { postId: props.postId }
    });

    const commentsRaw = res.data;

    // 각각의 댓글에 대해 likedByCurrentUser 요청 병렬 처리
    const commentsWithLikeStatus = await Promise.all(
      commentsRaw.map(async c => {
        const likeRes = await axios.get('/api/posts/comment/like/check', {
          params: { commentId: c.commentId, memberId: props.memberId }
        });
        return {
          id: c.commentId,
          username: c.nickname,
          avatar: c.profileImage,
          text: c.content,
          timeAgo: c.createdAt,
          likeCount: c.likeCount,
          likedByCurrentUser: likeRes.data
        };
      })
    );

    comments.value = commentsWithLikeStatus;
    commentCount.value = commentsWithLikeStatus.length;
    currentPage = 0;
    displayedComments.value = [];
    loadMore();
  } catch (err) {
    console.error('❌ 댓글 불러오기 실패:', err);
  }
};


const loadMore = () => {
  if (isLoading.value) return;
  isLoading.value = true;
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const next = comments.value.slice(start, end);
  if (next.length === 0) return;
  displayedComments.value.push(...next);
  currentPage++;
  isLoading.value = false;
};

const onScroll = () => {
  const el = scrollArea.value;
  if (!el) return;
  scrollPosition.value = el.scrollTop;
  const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  if (bottom) loadMore();
};

const scrollToTop = () => {
  const el = scrollArea.value;
  if (el) el.scrollTop = 0;
};

const handleTogglePostLike = async () => {
  try {
    const url = postLikedByCurrentUser.value
      ? '/api/posts/unlike'
      : '/api/posts/like';

    await axios.post(url, null, {
      params: { postId: props.postId, memberId: props.memberId }
    });

    postLikeCount.value += postLikedByCurrentUser.value ? -1 : 1;
    postLikedByCurrentUser.value = !postLikedByCurrentUser.value;
  } catch (err) {
    console.error('❌ 좋아요 토글 실패:', err);
  }
};

// 초기에 댓글 로딩만 수행 (post는 watch로 감지함)
onMounted(() => {
  // loadMore();
});

// postId 변경 시 게시글/댓글 다시 가져오기
watch(() => props.postId, async (id) => {
  if (id) {
    await fetchPostDetail();
    await checkPostLikeStatus();
    await fetchComments();
    loadMore();
  }
}, { immediate: true });
</script>

<style scoped>
.marker-scroll-wrapper {
  display: flex;
  flex-direction: row;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 0;
  scroll-behavior: smooth;
}

.marker-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.marker-scroll-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

/* 각 마커가 줄어들지 않도록 */
.custom-marker {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
}

</style>
