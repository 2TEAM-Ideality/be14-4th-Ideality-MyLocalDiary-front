<template>
  <div style="display: flex; height: 80vh; overflow: hidden">
    <!-- 왼쪽: 이미지 -->
    <div
      class="left-pane d-flex align-center justify-center"
      style="flex: 5.6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1); overflow-y: auto; height: 80vh; width: 100vh"
    >
      <PostPhoto v-once :images="photoList" />
    </div>

    <!-- 오른쪽: 본문 및 댓글 -->
    <div class="right-pane d-flex" style="flex: 4.4; flex-direction: column; padding: 30px; position: relative">
      <div ref="scrollArea" class="flex-grow-1 overflow-y-scroll pr-4 pt-4" @scroll="onScroll">
        <div class="d-flex justify-space-between">
          <PostAuthorCard :author="author" />
          <MenuToggle />
        </div>

        <div class="pt-2">
          <hr>
          <h3>{{ postTitle }}</h3>
          <hr>
        </div>

        <div
          v-if="isMine"
          class="d-inline-flex align-center rounded-pill px-3 py-1 mb-2"
          style="background-color: #fecccc; font-size: 14px; margin-top: 16px"
        >
          <span @click="postType = 'post'" :class="postType === 'post' ? 'text-black' : 'text-grey-darken-1'" class="cursor-pointer" style="margin-right: 6px;">
            Post
          </span>
          <span class="text-grey-darken-2">|</span>
          <span @click="postType = 'diary'" :class="postType === 'diary' ? 'text-black' : 'text-grey-darken-1'" class="cursor-pointer" style="margin-left: 6px;">
            Diary
          </span>
        </div>

        <div class="pb-5">
          <PostContentCard :content="postType === 'post' ? postContent : diaryContent" />
        </div>

        <div class="d-flex" style="gap: 10px; align-items: center;">
          <PostLikeIcon :likedByCurrentUser="postLikedByCurrentUser" :likeCount="postLikeCount" @toggle="handleTogglePostLike" />
          <v-icon size="32" @click="toggleCommentVisibility">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 19C11.78 19 13.52 18.47 15 17.48C16.48 16.49 17.63 15.09 18.31 13.44C18.99 11.8 19.17 9.99 18.83 8.24C18.48 6.5 17.62 4.89 16.36 3.64C15.11 2.38 13.5 1.52 11.76 1.17C10.01 0.83 8.2 1 6.56 1.69C4.91 2.37 3.51 3.52 2.52 5C1.53 6.48 1 8.22 1 10C1 11.49 1.36 12.89 2 14.13L1 19L5.87 18C7.11 18.64 8.51 19 10 19Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </v-icon>
          <div>{{ commentCount }}</div>
        </div>

        <div style="font-size: 14px; color: grey">{{ createdAt }}</div>
        <v-divider class="my-3" />

        <!-- 댓글 목록 -->
        <div class="comment-container">
          <PostCommentCard v-for="(comment, index) in displayedComments" :key="index" :comment="comment" />
        </div>
      </div>

      <!-- 스크롤 위로 버튼 -->
      <button v-show="scrollPosition > 300" @click="scrollToTop" style="position: absolute; top: 74%; right: 50%; width: 32px; height: 32px; border-radius: 50%; background-color: #fff5f7; color: #020725; border: none; cursor: pointer; font-size: 16px">
        ↑
      </button>

      <v-divider class="my-3" />
      <PostCommentInput />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import PostAuthorCard from './PostAuthorCard.vue';
import PostContentCard from '@/components/post/PostContentCard.vue';
import PostCommentCard from './PostCommentCard.vue';
import PostPhoto from '@/components/post/PostPhoto.vue';
import PostLikeIcon from './PostLikeIcon.vue';
import PostCommentInput from './PostCommentInput.vue';
import MenuToggle from './MenuToggle.vue';

const props = defineProps({ postId: Number, memberId: Number });

const postId = props.postId;
const memberId = props.memberId;
const author = ref({});
const writerId = ref();
const postTitle = ref('');
const postContent = ref('');
const diaryContent = ref('');
const createdAt = ref('');
const photoList = ref([]);
const postLikeCount = ref(0);
const postLikedByCurrentUser = ref(false);
const isMine = ref(false);
const postType = ref('post');

const comments = ref([]);
const commentCount = ref(0);
const displayedComments = ref([]);
const pageSize = 5;
let currentPage = 0;
const isLoading = ref(false);
const scrollArea = ref(null);
const scrollPosition = ref(0);

const fetchPostDetail = async () => {
  try {
    const [detailRes, likeRes] = await Promise.all([
      axios.get(`/api/posts/my/${postId}`, { params: { memberId } }),
      axios.get('/api/posts/like/check', { params: { postId, memberId } })
    ]);

    const data = detailRes.data;
    postTitle.value = data.title;
    postContent.value = data.post;
    diaryContent.value = data.diary;
    createdAt.value = data.createdAt;
    writerId.value = data.memberId;
    photoList.value = data.photos.map(photo => ({ id: photo.id, url: photo.url, orders: photo.orders, post_id: data.postId }));
    author.value = { name: data.nickname, avatar: data.profileImage };
    isMine.value = memberId === writerId.value;

    // 좋아요 여부 및 개수 가져오기
    postLikedByCurrentUser.value = likeRes.data;
    const countRes = await axios.get('/api/posts/like/count', { params: { postId } });
    postLikeCount.value = countRes.data;
  } catch (err) {
    console.error('❌ 게시글 상세/좋아요 정보 불러오기 실패:', err);
  }
};

const fetchComments = async () => {
  try {
    const res = await axios.get('/api/posts/comments', { params: { postId } });
    comments.value = res.data.map(c => ({
      id: c.commentId,
      username: c.nickname,
      avatar: c.profileImage,
      text: c.content,
      timeAgo: c.createdAt,
      likeCount: c.likeCount,
      likedByCurrentUser: c.likedByCurrentUser
    }));
    commentCount.value = comments.value.length;
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
  if (next.length > 0) {
    displayedComments.value.push(...next);
    currentPage++;
  }
  isLoading.value = false;
};

const onScroll = () => {
  const el = scrollArea.value;
  if (!el) return;
  scrollPosition.value = el.scrollTop;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMore();
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
      params: { postId, memberId }
    });

    postLikeCount.value += postLikedByCurrentUser.value ? -1 : 1;
    postLikedByCurrentUser.value = !postLikedByCurrentUser.value;
  } catch (err) {
    console.error('❌ 좋아요 토글 실패:', err);
  }
};


onMounted(async () => {
  await fetchPostDetail();
  await fetchComments();
});
</script>

<style scoped>
</style>