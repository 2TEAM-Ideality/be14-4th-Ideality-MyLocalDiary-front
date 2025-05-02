<template>
  <v-card class="user-card">
    <!-- 상단 유저 정보 -->
    <v-card-title class="user-header">
      <v-avatar size="60" @click="goToMypage" class="profile-image">
        <img :src="userInfo?.profileImage || '/images/profile/defaultProfile.png'" />
      </v-avatar>
      <div class="user-info">
        <div class="name-section">
          <div class="name" @click="goToMypage">{{ userInfo?.nickname }}</div>
          <button class="follow-btn" size="small">팔로우</button>
        </div>
        <div class="stats">
          게시글 <b>{{ postCount }}</b> · 팔로워 <b>{{ followers }}</b> · 팔로우 <b>{{ followings }}</b>
        </div>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- 오늘의 기록 -->
    <v-card-text class="section">
      <div class="section-header d-flex justify-space-between">
        <div class="section-title">{{ userInfo?.nickname }} 님의 기록</div>
        <router-link :to="`/mypage/${userInfo?.id}`" class="see-all">전체 기록 보기 →</router-link>
      </div>

      <div>
        <v-row dense v-for="(post, i) in todaysPosts" :key="i" class="post-item">
          <v-col cols="auto">
            <v-avatar size="32" class="marker-icon">
              <img :src="post.icon" alt="marker" />
            </v-avatar>
          </v-col>
          <v-col>
            <div class="post-title">{{ post.title }}</div>
            <!-- <div class="post-location">{{ post.location }}</div> -->
          </v-col>
          <v-col cols="auto">
            <div class="time">{{ post.time }}</div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <!-- 스탬프 -->
    <v-card-text class="section">
      <div class="section-header d-flex justify-space-between">
        <div class="section-title">발자국을 남긴 곳</div>
          <router-link :to="`/stamp/${userInfo?.id}`" class="see-all">스탬프 컬렉션 →</router-link>
        </div>
      <div class="badge-row d-flex gap-3">
        <v-avatar
          v-for="(badge, i) in displayedBadges"
          :key="i"
          size="48"
          @click="goToStamp"
        >
          <img :src="badge" />
        </v-avatar>
        <v-chip v-if="hiddenBadgeCount > 0" size="small" class="muted" color="grey">
          +{{ hiddenBadgeCount }}
        </v-chip>
      </div>
    </v-card-text>

    <!-- 동네 -->
    <v-card-text class="section">
      <div class="section-header d-flex justify-space-between">
        <div class="section-title">발견한 동네</div>
      </div>
      <div class="neighborhoods-one-line d-flex align-center">
        <LocationChip
          v-for="(place, i) in visibleNeighborhoods"
          :key="i"
          :place="place"
        />
        <v-chip
          v-if="hiddenNeighborhoodCount > 0"
          size="small"
          class="muted"
          color="grey"
        >
          +{{ hiddenNeighborhoodCount }}
        </v-chip>
      </div>
    </v-card-text>

  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, watch, ref } from 'vue'
import LocationChip from '@/components/common/LocationChip.vue'
import stampDummy from '@/assets/stamp_pic/독서냥.png'

// 🔸 Props 받기
const props = defineProps({
  userInfo: Object,
  postCount: Number,
  followers: Number,
  followings: Number,
  postList: Array
})


const router = useRouter()

const goToStamp = () => {
  router.push(`/stamp/${props.userInfo.id}`)
}
const goToMypage = () => {
  if (props.userInfo?.id) {
    router.push(`/mypage/${props.userInfo.id}`)
  }
}


// 뱃지 관련
const maxBadgesToShow = 5
const badges = Array(7).fill(stampDummy)
const displayedBadges = computed(() => badges.slice(0, maxBadgesToShow))
const hiddenBadgeCount = computed(() => badges.length - maxBadgesToShow)
const neighborhoods = ref([]);

const MAX_NEIGHBORHOODS = 2

const visibleNeighborhoods = computed(() =>
  neighborhoods.value.slice(0, MAX_NEIGHBORHOODS)
)

const hiddenNeighborhoodCount = computed(() =>
  neighborhoods.value.length - MAX_NEIGHBORHOODS
)



const todaysPosts = computed(() => {
  if (!props.postList) return []
  return props.postList.slice(0, 3).map(post => ({
    title: post.placeName || '장소 없음',
    location: post.placeName,
    time: '', // 시간 없음
    icon: post.thumbnailImage || stampDummy
  }))
})


watch(
  () => props.postList,
  (list) => {
    if (!list) return
    const uniquePlaces = [...new Set(list.map(post => post.placeName).filter(Boolean))]
    neighborhoods.value = uniquePlaces.map(name => ({ name }))
  },
  { immediate: true }
)



</script>

<style scoped>
.user-card {
  width: 370px;
  padding: 20px 10px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  overflow: hidden;
}

.user-header {
  display: flex;
  gap: 20px;
  padding-bottom: 15px;
  width: 100%;
}

.name-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
}

.profile-image {
  cursor: pointer;
}
.user-info {
  width: 100%;
}

.user-info .name {
  font-size: 18px;
  font-weight: 600;
}

.follow-btn {
  margin-top: 6px;
  padding: 5px 15px;
  font-size: 12px;
  background-color: #2C2C2C;
  border-radius: 8px;
  color: white;
  width: fit-content !important;
  float: right;
}

.stats {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
}

.section {
  margin-top: 12px;
}

.section-header {
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.see-all {
  font-size: 12px;
  color: #2C2C2C;
  text-decoration: none;
  cursor: pointer;
}
.see-all:hover {
  text-decoration: underline;
}

.post-item {
  padding: 10px 5px;
}
.post-title {
  font-weight: 600;
  font-size: 14px;
}
.post-location {
  font-size: 12px;
  color: #777;
}
.time {
  font-size: 12px;
  color: #999;
}

.badge-row {
  gap: 8px;
  align-items: center;
}
.badge-row img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ← 이걸로 변경 */
  display: block;
  cursor: pointer;
  border-radius: 50%; /* 둥근 테두리 보장 */
}
.neighborhoods-oneline {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  gap: 15px;
  max-width: 100%;
}
.marker-icon img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.muted {
  color: #777;
}
</style>
