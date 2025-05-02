<template>
    <div class="container">
        <v-row no-gutters class="search-bar-row">
            <v-text-field
                v-model="searchQuery"
                placeholder="게시글 검색"
                append-inner-icon="mdi-magnify"
                hide-details
                variant="solo-inverted"
                density="comfortable"
                class="pill-input"
                width="400"
            />
        </v-row>
        <PostListCard v-for="(post, index) in currentPagePosts"
            :key="index"
            :post="post"
            @click="handleCardClick(post.postId)"
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
    import { ref, computed, onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import axios from 'axios'

    const route = useRoute()
    const userStore = useUserStore()

    const selectedPostId = ref(null)
    const searchQuery = ref('') // 검색어

    function handleCardClick(postId) {
        selectedPostId.value = postId
        console.log(selectedPostId.value)
    }
    const allPosts = ref([]);   // 게시글 목록

    const postsPerPage = 4 // 한 페이지에 보여줄 게시물 수
    const currentPage = ref(1) // 현재 페이지

    const filteredPosts = computed(() => {
        if (!searchQuery.value) return allPosts.value;
        return allPosts.value.filter(post =>
            post.placeName.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    });

    const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage)) // 전체 페이지 수

    // 현재 페이지에 해당하는 게시물만 반환하는 computed 속성
    const currentPagePosts = computed(() => {
        const startIndex = (currentPage.value - 1) * postsPerPage
        const endIndex = startIndex + postsPerPage
        return filteredPosts.value.slice(startIndex, endIndex)
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


    const fetchPostList = async () => {
        console.log("POST LIST 데이터 가져오기");
        try {
            const isMyPost = Number(route.params.id) === userStore.id;

            const url = isMyPost
                ? `/api/posts/my/map`
                : `/api/posts/follow/map`;

            console.log('📌 요청 보냄:', url, 'with memberId:', userStore.id);

            const res = await axios.get(url, {
                params: { memberId: userStore.id },
                headers: {
                    Authorization: `Bearer ${userStore.token}`
                }
            });

            let data = res.data;

            // ✅ createdAt 기준 내림차순 정렬
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            console.log('📌 POST LIST 정렬된 게시글 목록:', data);
            allPosts.value = data;

        } catch (error) {
            console.error('❌ 게시글 목록 가져오기 실패', error);
        }
    }

    onMounted(() => {
        fetchPostList();
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
    
.title-text {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 12px;
    font-weight: bold;
    }
    .search-bar-row {
    align-items: center; /* ✅ 이걸로 아이콘과 텍스트필드 중앙 정렬 */
    gap: 12px;
    margin-bottom: 16px; /* 옵션: 아래 공간 필요할 경우 */
    padding-top: 12px;
    }
    .pill-input ::v-deep(.v-input__control) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    min-height: 40px !important;
    }
    .pill-input ::v-deep(.v-input.v-input--focused .v-field),
    .pill-input ::v-deep(.v-field--focused),
    .pill-input ::v-deep(.v-field__overlay) {
    background-color: #fff !important;
    border-color: #D9D9D9 !important;
    box-shadow: none !important;
    }
    .pill-input ::v-deep(.v-field) {
    border-radius: 9999px !important;
    border: 1px solid #D9D9D9 !important;
    background-color: #fff !important;
    box-shadow: none !important;
    align-items: center;
    min-height: 40px !important;
    padding-left: 12px;
    padding-right: 8px;
    }
    .pill-input ::v-deep(.v-field--focused) {
    border-color: #D9D9D9 !important;
    background-color: #fff !important;
    box-shadow: none !important;
    }
    .pill-input ::v-deep(input) {
    color: black !important;
    font-size: 14px;
    padding: 0 8px !important;
    line-height: 40px;
    }
    .pill-input ::v-deep(input::placeholder) {
    color: black !important;
    opacity: 1 !important;
    }
</style>