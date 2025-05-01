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
        width: 100vh"
    >
      <!-- 사진 -->
      <PostPhoto v-once :images="photoList"/>
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
          <MenuToggle/>
        </div>
  
        <!-- 게시글 제목 -->
        <div class="pt-2">
          <h3>{{ postTitle }}</h3>
        </div>
        <!-- 게시글 내용 -->
        <!-- post/diary 타입 선택 -->
        <div
          v-if="isMine"
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
        <div class="pb-5">
          <PostContentCard
            :content="postType === 'post' ? postContent : diaryContent"
          />
        </div>
        <div class="d-flex" style="gap: 10px; align-items: center;">
          <!-- 좋아요 -->
          <PostLikeIcon
            :likedByCurrentUser="postLikedByCurrentUser"
            :likeCount="postLikeCount"
            @toggle="handleTogglePostLike"
          />
          <!-- 댓글 수 -->
          <v-icon size="32" style="justify-content: center; align-content: center;" @click="toggleCommentVisibility">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 19C11.78 19 13.5201 18.4722 15.0001 17.4832C16.4802 16.4943 17.6337 15.0887 18.3149 13.4442C18.9961 11.7996 19.1743 9.99002 18.8271 8.24419C18.4798 6.49836 17.6226 4.89472 16.364 3.63604C15.1053 2.37737 13.5016 1.5202 11.7558 1.17294C10.01 0.82567 8.20038 1.0039 6.55585 1.68509C4.91131 2.36628 3.50571 3.51983 2.51677 4.99987C1.52784 6.47991 1 8.21997 1 10C1 11.488 1.36 12.891 2 14.127L1 19L5.873 18C7.109 18.64 8.513 19 10 19Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </v-icon>
          <div>
              {{ commentCount }}
          </div>
        </div>
        <div style="font-size: 14px; color:grey">{{ createdAt }}</div>
        <v-divider class="my-3"/>
        <!-- 댓글 목록 -->
        <div v-if="isCommentVisible" class="comment-container">
            <PostCommentCard v-for="(comment, index) in displayedComments"
            :key="index"
            :comment="comment"/>
        </div>
      </div>
      <button 
      v-show="scrollPosition > 300"
      @click="scrollToTop"
      style="
        position: absolute;
        top: 74%;
        right: 50%;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #fff5f7;
        color: #020725;
        border: none;
        cursor: pointer;
        font-size: 16px;
      "
      >
      ↑
      </button>
      <v-divider class="my-3"/>
      <!-- 댓글 작성 -->
      <PostCommentInput />
    </div>
  </div>
</template>
  

<script setup>
  import PostAuthorCard from './PostAuthorCard.vue';
  import PostContentCard from '@/components/post/PostContentCard.vue';
  import PostCommentCard from './PostCommentCard.vue';
  import PostPhoto from '@/components/post/PostPhoto.vue';
  import PostLikeIcon from './PostLikeIcon.vue';
  import PostCommentInput from './PostCommentInput.vue';
  import MenuToggle from './MenuToggle.vue';
  import { ref, onMounted } from 'vue';
  import axios from 'axios';

  const props = defineProps({
    postId: Number,
    memberId: Number
  })

  const postId=props.postId;
  const memberId=props.memberId;

  const author=ref({});
  const writerId=ref()
  const postTitle=ref('')
  const postContent=ref('')
  const diaryContent=ref('')
  const createdAt=ref('')
  const photoList=ref([])
  const postLikeCount = ref()
  const postLikedByCurrentUser = ref(false)
  const isMine=ref()

  // const photoList = [
  //   { id: 1, url: 'https://randomuser.me/api/portraits/men/2.jpg', orders: 1, post_id: 10 },
  //   { id: 2, url: 'https://img.news-wa.com/img/upload/2024/09/10/NWC_20240910205105.png', orders: 2, post_id: 10 },
  //   { id: 3, url: 'https://photo.newsen.com/news_photo/2023/08/02/202308021551233510_1.jpg', orders: 3, post_id: 10 },
  //   { id: 4, url: 'https://i.namu.wiki/i/uJdm1UUvAU1I3_zo4zC-FBg5t4tA6kT-FQ9HiFbPs7fMl7pacQfaSXlkTZla69iuwCx0vwwTlulboMyPPTpb5g.webp', orders:4, post_id:10}
  // ]

  const postData=ref(null);
  onMounted(async ()=>{
    await fetchPostDetail()
    loadMore()
  })

  const fetchPostDetail=async ()=>{
    try{
      const res=await axios.get(`/api/posts/my/${postId}`,{
        params: { memberId }
      })
      postData.value=res.data
      initializeFromResponse(postData.value)
    }catch(err){
      console.error(`Failed to fetch post detail`, err)
    }
  }

  

  const initializeFromResponse=(data)=>{
    author.value={
      name: data.nickname,
      avatar: data.profileImage,
    }
    postTitle.value = data.title
    postContent.value=data.post
    diaryContent.value=data.diary
    createdAt.value=data.createdAt
    writerId.value=data.memberId
    postLikeCount.value=data.postLikeCount
    photoList.value=data.photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      orders: photo.orders,
      post_id: data.postId
    }))
    if(memberId===writerId.value){
      isMine.value=true
    }else{
      isMine.value=false
    }
  }



  const postType = ref('post')

  // 좋아요 날짜 부분도 컴포넌트로 빼자
  
  

  const handleTogglePostLike = () => {
    if (postLikedByCurrentUser.value) {
        postLikeCount.value--
    } else {
      postLikeCount.value++
    }
    postLikedByCurrentUser.value = !postLikedByCurrentUser.value
  }

  const isCommentVisible = ref(false)

  const toggleCommentVisibility = () => {
    isCommentVisible.value = !isCommentVisible.value
  }
  const comments = [
  {
    id: '2',
    username: '_one____eno_',
    avatar: 'https://randomuser.me/api/portraits/women/20.jpg',
    text: '맨앞에 반팔셔츠는 공홈에 없나요?',
    timeAgo: '2025-04-26T15:00:00+09:00',
    likeCount: 3,
    likedByCurrentUser: false
  },
  {
    id: '3',
    username: 'mmmm.d2',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    text: '여름 셔츠 발매는 언제인가요',
    timeAgo: '2025-04-28T12:00:00+09:00',
    likeCount: 5,
    likedByCurrentUser: false
  },
  {
    id: '3',
    username: 'mmmm.d2',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    text: '여름 셔츠 발매는 언제인가요',
    timeAgo: '2025-04-28T12:19:00+09:00',
    likeCount: 4,
    likedByCurrentUser: false
  },
]
  const commentCount = comments.length;
  const isLoading = ref(false)
  const displayedComments = ref([])
  const pageSize = 5
  let currentPage = 0
  const scrollArea = ref(null)

  onMounted(() => {
    loadMore()
  })

  const loadMore = () => {
    if(isLoading.value) {
      return
    } 

    isLoading.value = true
    
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const next = comments.slice(start, end);
    
    if(next.length === 0) {
      isLoading.value = false
      return
    }

    displayedComments.value.push(...next);
    currentPage++;
    isLoading.value = false
  }
  const scrollPosition = ref(0)
  const onScroll = () => {
    const el = scrollArea.value
    if (!el) return
    scrollPosition.value = el.scrollTop
    const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
    if (bottom) {
      loadMore()
    }
  }
  const scrollToTop = () => {
    const el = scrollArea.value
    if (el) {
      el.scrollTop = 0  // 스크롤을 맨 위로 이동
    }
  }
</script>

<style scoped>
</style>