<template>
  <div style="display: flex; height: 80vh; overflow:hidden">
    <!-- 왼쪽 고정 블럭 -->
    <div
      class="left-pane d-flex align-center justify-center"
      style="flex: 5.6;
        border-right: 1px solid #E5E7EB;
        box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        height: 80vh;
        width: 100%"
    >
      <!-- 사진 -->
      <PostPhoto  :images="photoList"/>
    </div>
    <!-- 오른쪽 스크롤 블럭 + 댓글 고정 영역 -->
    <div
      class="right-pane d-flex"
      style="flex: 4.4;
        display: flex; 
        position: relative;
        flex-direction: column; 
        padding-left: 30px;
        padding-right: 30px;
        min-width: 0; max-width: 100%;">
      <div
        ref="scrollArea"
        class="flex-grow-1 overflow-y-scroll pr-4 pt-4"
        @scroll="onScroll"
      >
        <div class="d-flex" style="justify-content: space-between;">
          <!-- 작성자 정보 -->
          <PostAuthorCard :author="author"/>
          <MenuToggle :type="'POST'" :reported-id="props.postId" />
        </div>

        <!-- 게시글 제목 -->
        <div class="pt-2">
          {{ postTitle }}
        </div>

        <!-- post/diary 타입 선택 -->
        <div
          class="d-inline-flex align-center rounded-pill px-3 py-1 mb-2"
          style="background-color: #fecccc; font-size: 14px; user-select: none; width: fit-content; margin-top: 16px"
        >
          <span
            @click="postType = 'post'"
            :class="postType === 'post' ? 'text-black' : 'text-grey-darken-1'"
            class="cursor-pointer"
            style="margin-right: 6px;"
          >
            Post
          </span>

          <span class="text-grey-darken-2">|</span>

          <span
            @click="postType = 'diary'"
            :class="postType === 'diary' ? 'text-black' : 'text-grey-darken-1'"
            class="cursor-pointer"
            style="margin-left: 6px;"
          >
            Diary
          </span>
        </div>

        <!-- 게시글 내용 -->
        <div class="pb-5">
          <PostContentCard 
            :content="postType === 'post' ? postContent : diaryContent"
          />
        </div>

        <div class="d-flex" style="gap: 10px; align-items: center;">
          <PostLikeIcon
            :likedByCurrentUser="postLikedByCurrentUser"
            :likeCount="postLikeCount"
            @toggle="handleTogglePostLike"
          />
          <v-icon size="32" @click="toggleCommentVisibility">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 19C11.78 19 13.5201 18.4722 15.0001 17.4832C16.4802 16.4943 17.6337 15.0887 18.3149 13.4442C18.9961 11.7996 19.1743 9.99002 18.8271 8.24419C18.4798 6.49836 17.6226 4.89472 16.364 3.63604C15.1053 2.37737 13.5016 1.5202 11.7558 1.17294C10.01 0.82567 8.20038 1.0039 6.55585 1.68509C4.91131 2.36628 3.50571 3.51983 2.51677 4.99987C1.52784 6.47991 1 8.21997 1 10C1 11.488 1.36 12.891 2 14.127L1 19L5.873 18C7.109 18.64 8.513 19 10 19Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </v-icon>
          <div>{{ commentCount }}</div>
        </div>
        <div style="font-size: 14px; color:grey">{{ createdAt }}</div>
        <v-divider class="my-3"/>

        <div v-if="isCommentVisible" class="comment-container">
          <PostCommentCard v-for="(comment, index) in displayedComments" :key="index" :comment="comment"/>
        </div>
      </div>

      <button 
        v-show="scrollPosition > 300"
        @click="scrollToTop"
        style="position: absolute; top: 74%; right: 50%; width: 32px; height: 32px; border-radius: 50%; background-color: #fff5f7; color: #020725; border: none; cursor: pointer; font-size: 16px;"
      >
        ↑
      </button>
      <v-divider class="my-3"/>
      <PostCommentInput />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,  computed , watch } from 'vue';
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

const props = defineProps({ postId: Number });
console.log(props.postId)
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
const postType = ref('post');

const postLikeCount = ref(777);
const postLikedByCurrentUser = ref(false);

const handleTogglePostLike = () => {
  postLikeCount.value += postLikedByCurrentUser.value ? -1 : 1;
  postLikedByCurrentUser.value = !postLikedByCurrentUser.value;
};

const isCommentVisible = ref(false);
const toggleCommentVisibility = () => {
  isCommentVisible.value = !isCommentVisible.value;
};

const comments = [
  { id: '2', username: '_one____eno_', avatar: 'https://randomuser.me/api/portraits/women/20.jpg', text: '맨앞에 반팔셔츠는 공홈에 없나요?', timeAgo: '2025-04-26T15:00:00+09:00', likeCount: 3, likedByCurrentUser: false },
  { id: '3', username: 'mmmm.d2', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', text: '여름 셔츠 발매는 언제인가요', timeAgo: '2025-04-28T12:00:00+09:00', likeCount: 5, likedByCurrentUser: false },
  { id: '4', username: 'mmmm.d2', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', text: '여름 셔츠 발매는 언제인가요', timeAgo: '2025-04-28T12:19:00+09:00', likeCount: 4, likedByCurrentUser: false }
];

const commentCount = comments.length;
const displayedComments = ref([]);
const pageSize = 5;
let currentPage = 0;
const isLoading = ref(false);
const scrollArea = ref(null);
const scrollPosition = ref(0);

const loadMore = () => {
  if (isLoading.value) return;
  isLoading.value = true;
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const next = comments.slice(start, end);
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

const fetchPostDetail = async (id) => {
  try {
    const isMyPost = Number(route.params.id) === userStore.id;
  const url = isMyPost
    ? `/api/posts/my/${id}`
    : `/api/posts/follow/${id}`;

  console.log('📌 [fetch] 시작:', id, 'memberId:', userStore.id);

  const res = await axios.get(url, {
    params: { memberId: userStore.id },
    headers: {
      Authorization: `Bearer ${userStore.token}`
    }
  });

    console.log('📌 [fetch] 응답:', res.data);

    const data = res.data;
    console.log(data)
    author.value = { name: data.nickname, avatar: data.profileImage };
    postTitle.value = data.title;
    postContent.value = data.post;
    diaryContent.value = data.diary;
    createdAt.value = data.createdAt;

    console.log('📷 사진 데이터:', data.photos); // ✅ 중요

    photoList.value = Array.isArray(data.photos)
      ? data.photos.map(p => ({
          id: p.id,
          url: p.imageUrl,
          orders: p.orders,
          post_id: data.postId
        }))
      : [];

    console.log('✅ 최종 photoList:', photoList.value);

  } catch (err) {
    console.error('❌ fetchPostDetail 실패:', err);
  }
};

onMounted(() => {
  if (props.postId) fetchPostDetail(props.postId);
  loadMore();
});

watch(() => props.postId, async (id) => {
  console.log('📌 PostCard 감지된 postId:', id); // ✅ 이거 출력됨?
  if (id) fetchPostDetail(id);
}, { immediate: true });




</script>

<style scoped>
</style>
