<template>
    <div>
        <PostListCard v-for="(post, index) in currentPagePosts"
            :key="index"
            :post="post"
            @click="handleCardClick(post.id)"
            />
        <v-divider class="my-3"/>
        <!-- 페이지네이션 -->
        <div class="pagination" style="justify-content: center;">
            <!-- 첫 페이지 -->
            <span
                v-if="currentPage > 1 && !visiblePages.includes(1)"
                @click="goToPage(1)"
                :class="{'page-number': true, 'disabled-page': currentPage !== 1}"
            >
                1
            </span>
            <span v-if="currentPage > 5" class="ellipsis">...</span>

            <!-- 페이지 번호들 -->
            <span
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="{ 'active-page': currentPage === page, 'inactive-page': currentPage !== page }"
                class="page-number"
            >
                {{ page }}
            </span>

            <span v-if="currentPage < totalPages - 3" class="ellipsis">...</span>

            <!-- 마지막 페이지 -->
            <span
                v-if="currentPage < totalPages && !visiblePages.includes(totalPages)"
                @click="goToPage(totalPages)"
                :class="{'page-number': true, 'disabled-page': currentPage !== totalPages}"
            >
                {{ totalPages }}
            </span>
        </div>
    </div>
    <!-- 모달 예시 -->
    <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
        <div class="modal-content d-flex flex-column" @click.stop style="
            width: 1000px;
            height: 90%;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
        ">
            <div class="d-flex justify-end">
                <button class="pr-3 pl-3" @click="selectedPostId = null">X</button>
            </div>
            <PostCard/>
        </div>
    </div>
</template>

<script setup>
    import PostListCard from './PostListCard.vue'
    import PostCard from '../post/PostCard.vue'
    import { ref, computed } from 'vue'
    const selectedPostId = ref(null)
    function handleCardClick(postId) {
        selectedPostId.value = postId
        console.log(selectedPostId.value)
    }
    const allPosts = [
    {
        id: '1',
        postTitle: '제목1',
        createdAt: '2025.04.27',
        thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
        neighborhoods: [
            { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
            { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
        ]
    },
    {
        id: '2',
        postTitle: '제목2',
        createdAt: '2025.04.24',
        thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
        neighborhoods: [
            { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
            { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
        ]
    },
    {
        id: '3',
        postTitle: '제목3',
        createdAt: '2025.04.23',
        thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
        neighborhoods: [
            { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
            { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
            { name: 'text', latitude: 20.0, longitude: 20.0}
        ]
    },
    {
    id: '4',
    postTitle: '제목3',
    createdAt: '2025.04.23',
    thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
    neighborhoods: [
      { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
      { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
      { name: 'text', latitude: 20.0, longitude: 20.0}
    ]
  },
  {
    id: '5',
    postTitle: '제목4',
    createdAt: '2025.04.22',
    thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
    neighborhoods: [
      { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
      { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
    ]
  },
  {
    id: '6',
    postTitle: '제목5',
    createdAt: '2025.04.21',
    thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
    neighborhoods: [
      { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
      { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
    ]
  },
  {
    id: '7',
    postTitle: '제목6',
    createdAt: '2025.04.20',
    thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
    neighborhoods: [
      { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
      { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
    ]
  },
  {
    id: '8',
    postTitle: '제목7',
    createdAt: '2025.04.19',
    thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
    neighborhoods: [
      { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
      { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
    ]
  },
  {
    id: '9',
    postTitle: '제목7',
    createdAt: '2025.04.19',
    thumbnail: 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg',
    neighborhoods: [
      { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
      { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
    ]
  },
]
    const postsPerPage = 4 // 한 페이지에 보여줄 게시물 수
    const currentPage = ref(1) // 현재 페이지
    const totalPages = computed(() => Math.ceil(allPosts.length / postsPerPage)) // 전체 페이지 수

    // 현재 페이지에 해당하는 게시물만 반환하는 computed 속성
    const currentPagePosts = computed(() => {
        const startIndex = (currentPage.value - 1) * postsPerPage
        const endIndex = startIndex + postsPerPage
        return allPosts.slice(startIndex, endIndex)
    })

    // 페이지 이동 함수
    const goToPage = (page) => {
        currentPage.value = page
    }
    // 현재 페이지를 기준으로 보일 페이지 범위 계산
    const visiblePages = computed(() => {
        const pages = []
        let startPage = currentPage.value - 2
        let endPage = currentPage.value + 2

        // 첫 페이지가 1보다 작으면 1로 고정
        startPage = startPage < 1 ? 1 : startPage
        // 마지막 페이지가 totalPages보다 크면 totalPages로 고정
        endPage = endPage > totalPages.value ? totalPages.value : endPage

        // 시작 페이지부터 끝 페이지까지 페이지 번호를 배열에 추가
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        return pages
    })
</script>

<style scoped>
    .pagination {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .page-number {
        margin: 0 5px;
        cursor: pointer;
        font-size: 16px;
    }

    .active-page {
        color: black; /* 활성화된 페이지 색상 */
        font-weight: bold;
    }

    .inactive-page {
        color: gray; /* 비활성화된 페이지 색상 */
    }
    .ellipsis {
        margin: 0 10px;
        font-size: 16px;
        color: gray;
        transform: translateY(-4px);
    }
    .disabled-page {
        color: gray; /* 비활성화된 첫 번째 또는 마지막 페이지 색상 */
    }
    .modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
    }

    .modal-content {
        background-color: white;
        padding: 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
</style>