<template>
    <div ref="modalRef" class="search-user-modal">
        <v-card>
            <div class="search-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="title-text">검색</div>

                <v-btn icon variant="text" @click="emit('close')" style="margin-left: auto; margin-top: -20px;"
                    width="32" height="32">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
            <v-row no-gutters class="search-bar-row">
                <!-- 왼쪽 동그란 아이콘 -->
                <v-icon size="48">mdi-account-circle</v-icon>

                <!-- 오른쪽 검색창 -->
                <v-text-field v-model="searchQuery" placeholder="유저 검색" append-inner-icon="mdi-magnify" hide-details
                    variant="solo-inverted" density="comfortable" class="pill-input" style="flex: 1;" />
            </v-row>

            <v-divider class="divider-spacing" />

            <v-list lines="two" density="comfortable" class="user-list">

                <v-list-item v-for="user in filteredUsers" :key="user.id" class="user-list-item custom-list-item">
                    <!-- 왼쪽 아바타 -->
                    <template #prepend>
                        <v-avatar size="48" class="avatar-align">
                            <img :src="user.avatar" alt="avatar" />
                        </v-avatar>
                    </template>

                    <!-- 오른쪽 전체 정보 -->
                    <div class="user-info">
                        <!-- 상단: 이름 + 아이콘 + 팔로우 버튼 -->
                        <div class="user-header">
                            <div class="name-icon">
                                <span class="user-name">{{ user.name }}</span>
                                <!-- 공개 계정이면 user.icon 출력 -->
                                <v-icon v-if="user.icon && user.is_public" size="16" class="ml-1">
                                    {{ user.icon }}
                                </v-icon>

                                <!-- 비공개 계정이면 잠금 아이콘 출력 -->
                                <v-icon v-else-if="user.is_public === false" size="16" class="ml-1">
                                    mdi-lock
                                </v-icon>
                            </div>
                            <v-btn :ripple="false" :class="['follow-btn', statusClass(user.followStatus)]"
                                :variant="user.followStatus === 'wait' ? 'outlined' : 'flat'" size="small"
                                :disabled="user.followStatus === 'wait'" @click="handleClick(user)">
                                {{ user.statusText }}
                            </v-btn>
                        </div>

                        <!-- 하단: 자기소개 -->
                        <div class="user-subtitle">
                            {{ user.bio }}
                        </div>
                    </div>
                </v-list-item>

            </v-list>
        </v-card>
    </div>
</template>

<script setup>
import { ref, watch, onUnmounted, defineEmits } from 'vue';
import { useUserStore } from '@/stores/userStore';
import profileImage from '@/assets/profile/profile.png';

const modalRef = ref(null);
const emit = defineEmits(['close']);

const searchQuery = ref('');
const userStore = useUserStore();
const userId = userStore.id;
const token = userStore.token;

const filteredUsers = ref([]);
let timeoutId = null;

// ✅ 버튼 스타일 클래스 구분
const statusClass = (followStatus) => {
    if (followStatus === 'following') return 'btn-following';
    if (followStatus === 'wait') return 'btn-wait';
    return 'btn-follow';
};

// ✅ 팔로우 버튼 클릭 처리
async function handleClick(user) {
    try {
        const res = await fetch('http://localhost:8080/api/follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                followingMemberId: userId,
                followTargetMemberId: user.id,
                status: user.is_public ? true : false
            })
        });

        if (!res.ok) throw new Error('팔로우 실패');

        if (user.is_public) {
            user.followStatus = 'following';
            user.statusText = '팔로잉';
        } else {
            user.followStatus = 'wait';
            user.statusText = '수락 대기';
        }
    } catch (err) {
        console.error('팔로우 요청 실패:', err);
    }
}

// ✅ 실서버에서 유저 검색 및 follow 상태 받아오기
async function fetchSearchResults() {
    if (searchQuery.value.trim() === '') {
        filteredUsers.value = [];
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:8080/api/member/search?nickname=${searchQuery.value}&myId=${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const json = await res.json();

        filteredUsers.value = json.data.map(user => ({
            id: user.memberId,
            name: user.nickname || user.name,
            avatar: user.profileImage || profileImage,
            is_public: user.isPublic,
            bio: user.bio || '',
            icon: user.isPublic ? 'mdi-lock' : 'mdi-web',
            followStatus:
                user.statusText === '팔로잉' ? 'following'
                    : user.statusText === '수락 대기' ? 'wait'
                        : null,
            statusText: user.statusText
        }));
    } catch (error) {
        console.error('유저 검색 실패:', error);
    }
}

// ✅ 디바운싱으로 검색 요청 최적화
watch(searchQuery, () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        fetchSearchResults();
    }, 500);
});

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId);
});
</script>


<style scoped>
.v-card {
    /* width: 450px; */
    height: 100vh;
    padding: 24px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-left: 1px solid #eee;
    border-radius: 0;
    background-color: #fff;
    overflow-y: auto;
    font-family: sans-serif;
}

.title-text {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 12px;
    font-weight: bold;
}

.search-bar-row {
    align-items: center;
    /* ✅ 이걸로 아이콘과 텍스트필드 중앙 정렬 */
    gap: 12px;
    margin-bottom: 16px;
    /* 옵션: 아래 공간 필요할 경우 */
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

.divider-spacing {
    margin: 20px 0;
    /* 위아래 12px 간격 */
}

.custom-list-item {
    padding-left: 0;
    padding-right: 0;
    margin-left: -8px;
    /* 카드의 padding 보정 */
    margin-right: -8px;
    /* width: 380px; v-card보다 클 경우엔 margin도 조정 필요 */
}

.user-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 48px;
    /* 아바타 높이와 비슷하게 유지 */
}

.user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    /* ✅ 아이콘-버튼 사이에 최소 간격 확보 */
}

.name-icon {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 16px;
}

.user-name {
    font-weight: 700;
    white-space: nowrap;
    /* 👉 줄바꿈 방지 */
    overflow: hidden;
    /* 👉 넘치는 건 숨기기 */
    text-overflow: ellipsis;
    /* 👉 ... 표시 */
    max-width: 140px;
    /* 👉 최대 너비 설정 (필요에 따라 조정) */
}


.user-subtitle {
    font-size: 10px;
    color: #9C9C9C;
    margin-top: 4px;
    white-space: normal;
    word-break: break-word;
}

.follow-btn {
    flex-shrink: 0;
    width: 65px;
    height: 22px !important;
    /* ✨ 세로 고정 추가 (24px → 28px 추천) */
    min-height: 22px !important;
    /* ✨ 같이 맞춰주자 */
    border-radius: 8px;
    font-size: 13px;
    padding: 0px 8px;
    line-height: 1.2;
    justify-content: center;
    text-align: center;
    transition: none !important;
    box-shadow: none !important;
    background-image: none !important;
}




/* 상태별 커스텀 */
.btn-follow {
    background-color: #2C2C2C;
    color: #F5F5F5;
    /* 검정 */
}

.btn-following {
    background-color: #FFE8F3;
    /* 연한 핑크 */
    color: #efb8c8;
}

.btn-wait {
    background-color: #D9D9D9;
    /* 회색 */
    color: #B3B3B3;
}

.avatar-align {
    align-self: flex-start;
    margin-top: 2px;
}

.search-user-modal {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1100;
    width: 450px;
    /* ✨ 네가 원래 설정한 카드 크기 */
    height: 100vh;
    display: flex;
    /* ✨ 카드만 중앙정렬하려면 */
    flex-direction: column;
}
</style>