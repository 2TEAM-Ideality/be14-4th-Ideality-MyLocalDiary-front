<template>
    <div class="modal-overlay" @click.self="$emit('close')">
    <v-card class="follow-card">
        <v-card-title class="follow-header">팔로잉</v-card-title>
    
        <!-- 검색창 -->
        <div class="search-wrapper">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="검색"
            class="search-input"
        />
        <img src="@/assets/sidebar/Search.png" alt="검색" class="search-img-icon" />
        </div>
    
        <!-- 유저 리스트 스크롤 영역 -->
        <div class="follow-list">
        <v-card
            v-for="user in visibleFollowings"
            :key="user.id"
            class="follow-card-item"
            flat
        >
            <v-row no-gutters class="align-start">
            <v-col cols="auto" class="avatar-col">
                <v-avatar size="48">
                <img :src="user.avatar" />
                </v-avatar>
            </v-col>
    
            <v-col class="info-col">
                <div class="nickname-row">
                <div class="nickname">{{ user.nickname }}</div>
                <v-btn class="unfollow-btn" @click="deleteUser(user.id)">팔로잉</v-btn>
                </div>
                <div v-if="user.bio" class="bio">{{ user.bio }}</div>
            </v-col>
            </v-row>
        </v-card>
    
        <!-- 무한 스크롤 트리거 -->
        <div ref="sentinel" class="scroll-sentinel"></div>
        </div>
    </v-card>
    </div>
    </template>
    
<script setup>
    import { ref, computed, onMounted, onUnmounted } from 'vue'
    import { useUserStore } from '@/stores/userStore'
    import profileImage from '@/assets/profile/profile.png'

    const searchQuery = ref('')
    const userStore = useUserStore()
    const followings = ref([])  // ✅ 가져온 "팔로잉" 리스트
    const visibleCount = ref(4)
    const sentinel = ref(null)
    const userId = userStore.id

    // ✅ 서버에서 팔로잉 정보 불러오기
    const fetchFollowings = async () => {
    try {
        const res = await fetch(`http://localhost:3001/follow?following_member_id=${userId}`)
        const followingData = await res.json()

        followings.value = followingData.map(item => ({
        id: item.follower_target_member.id,
        nickname: item.follower_target_member.nickname,
        avatar: item.follower_target_member.profile_image || profileImage,
        bio: item.follower_target_member.bio || '',
        }))
    } catch (error) {
        console.error('팔로잉 목록 가져오기 실패:', error)
    }
    }

    // 검색어로 필터링
    const filteredFollowings = computed(() => {
    const query = searchQuery.value.trim()
    if (!query) return followings.value
    const regex = new RegExp(query, 'i')
    return followings.value.filter(user => regex.test(user.nickname || ''))
    })

    // 화면에 보이는 followings (무한스크롤)
    const visibleFollowings = computed(() =>
    filteredFollowings.value.slice(0, visibleCount.value)
    )

    // 삭제 버튼 클릭시
    const deleteUser = (id) => {
    followings.value = followings.value.filter(user => user.id !== id)
    }

    // 스크롤 감지해서 추가 로드
    const loadMore = () => {
    visibleCount.value += 2
    }

    let observer = null

    onMounted(async () => {
    await fetchFollowings()

    observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
        loadMore()
        }
    }, {
        root: document.querySelector('.follow-list'),
        threshold: 1.0
    })

    if (sentinel.value) {
        observer.observe(sentinel.value)
    }
    })

    onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
    })
</script>
    
<style scoped>


.modal-overlay {
    position: fixed;
    inset: 0; /* top, bottom, left, right = 0 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}
.follow-card {
    width: 400px;
    max-height: 500px; /* ✅ 카드 최대 높이만 제한 */
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.follow-header {
    font-weight: bold;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
}

.search-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 0 16px;
    margin-bottom: 24px;
}

.search-input {
    width: 120%;
    max-width: 94%;
    height: 24px;
    border: 1px solid #ccc;
    border-radius: 999px;
    padding: 0 40px 0 16px;
    font-size: 14px;
    outline: none;
    background-color: white;
}

.search-img-icon {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    pointer-events: none;
    opacity: 0.7;
}

.follow-list {
    height: 360px; /* 👈 각 카드 높이 + margin 계산 (예: 80~90px * 4) */
    overflow-y: auto;
    padding: 0 4px 12px;
}

.scroll-sentinel {
    height: 1px;
}

.follow-card-item {
    margin: 0 auto 20px auto; /* 기존보다 아래 여백을 살짝 더 줌 */
    max-width: 92%;
    padding: 10px 12px;
}

.avatar-col {
    margin-right: 16px;
}

.unfollow-btn {
    background-color: #D9D9D9;
    color: #B3B3B3;
    font-size: 14px;
    height: 22px !important;
    padding: 0 22px !important;
    line-height: 1;
    min-height: 0 !important;
    min-width: 0 !important;
    border-radius: 6px;
    text-transform: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    width: 75px;
}

.nickname-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nickname {
    font-weight: bold;
    font-size: 16px;
}

.bio {
    font-size: 13px;
    margin-top: 6px;
    color: #9C9C9C;
}
</style>