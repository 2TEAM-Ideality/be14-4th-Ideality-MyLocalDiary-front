<template>
    <div ref="modalRef" class="search-user-modal">
      <v-card>
        <div class="search-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="title-text">검색</div>
  
          <!-- 닫기 버튼 -->
          <v-btn
            icon
            variant="text"
            @click="closeModal"
            style="margin-left: auto; margin-top: -20px;"
            width="32"
            height="32"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
  
        <v-row no-gutters class="search-bar-row">
          <v-icon size="48">mdi-account-circle</v-icon>
          <v-text-field
            v-model="searchQuery"
            placeholder="유저 검색"
            append-inner-icon="mdi-magnify"
            hide-details
            variant="solo-inverted"
            density="comfortable"
            class="pill-input"
            style="flex: 1;"
          />
        </v-row>
  
        <v-divider class="divider-spacing" />
  
        <v-list lines="two" density="comfortable" class="user-list">
          <v-list-item
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-list-item custom-list-item"
          >
            <template #prepend>
              <v-avatar size="48" class="avatar-align">
                <img :src="user.avatar" alt="avatar" />
              </v-avatar>
            </template>
  
            <div class="user-info">
              <div class="user-header">
                <div class="name-icon">
                  <span class="user-name">{{ user.name }}</span>
                  <v-icon v-if="user.is_public" size="16" class="ml-1">mdi-web</v-icon>
                  <v-icon v-else-if="user.is_public === false" size="16" class="ml-1">mdi-lock</v-icon>
                </div>
                <v-btn
                  :ripple="false"
                  :class="['follow-btn', statusClass(user.followStatus)]"
                  :variant="user.followStatus === 'wait' ? 'outlined' : 'flat'"
                  size="small"
                  :disabled="user.followStatus === 'wait'"
                  @click="handleClick(user)"
                >
                  {{ user.statusText }}
                </v-btn>
              </div>
  
              <div class="user-subtitle">{{ user.bio }}</div>
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
  const closeModal = () => emit('close'); // ✅ 이 함수로 emit 분리
  
  const searchQuery = ref('');
  const filteredUsers = ref([]);
  let timeoutId = null;
  
  const userStore = useUserStore();
  const userId = userStore.id;
  const token = userStore.token;
  
  const statusClass = (followStatus) => {
    if (followStatus === 'following') return 'btn-following';
    if (followStatus === 'wait') return 'btn-wait';
    return 'btn-follow';
  };
  
  async function handleClick(user) {
    if (user.followStatus === 'wait') return;
  
    try {
      console.log(userStore.token);
      const method = user.followStatus === 'following' ? 'DELETE' : 'POST';
      const res = await fetch(`http://localhost:8080/api/follow`, {
  method,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userStore.token}`
  },
  body: JSON.stringify({
    followingMemberId: userStore.id,
    followTargetMemberId: user.id,
    ...(method === 'POST' && { status: user.is_public ? true : false })
  })
});
  
      if (!res.ok) throw new Error('Follow action failed');
  
      if (method === 'DELETE') {
        user.followStatus = null;
        user.statusText = '팔로우';
      } else {
        if (user.is_public) {
          user.followStatus = 'following';
          user.statusText = '팔로잉';
        } else {
          user.followStatus = 'wait';
          user.statusText = '수락 대기';
        }
      }
    } catch (err) {
      console.error('팔로우/언팔로우 요청 실패:', err);
    }
  }
  
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
          user.statusText === '팔로잉' ? 'following' :
          user.statusText === '수락 대기' ? 'wait' : null,
        statusText: user.statusText
      }));
    } catch (error) {
      console.error('유저 검색 실패:', error);
    }
  }
  
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
  .search-user-modal {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1100;
    width: 450px;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .v-card {
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
  }
  
  .search-bar-row {
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .pill-input ::v-deep(.v-input__control) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    min-height: 40px !important;
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
  
  .pill-input ::v-deep(input) {
    color: black !important;
    font-size: 14px;
    padding: 0 8px !important;
    line-height: 40px;
  }
  
  .divider-spacing {
    margin: 20px 0;
  }
  
  .custom-list-item {
    padding-left: 0;
    padding-right: 0;
    margin-left: -8px;
    margin-right: -8px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 48px;
  }
  
  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
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
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
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
    min-height: 22px !important;
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
  
  .btn-follow {
    background-color: #2C2C2C;
    color: #F5F5F5;
  }
  
  .btn-following {
    background-color: #FFE8F3;
    color: #efb8c8;
  }
  
  .btn-wait {
    background-color: #D9D9D9;
    color: #B3B3B3;
  }
  
  .avatar-align {
    align-self: flex-start;
    margin-top: 2px;
  }
  </style>
  