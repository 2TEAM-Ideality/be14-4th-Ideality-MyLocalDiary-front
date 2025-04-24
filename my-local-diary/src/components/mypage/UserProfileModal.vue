<template>
    <v-card class="user-card">
      <!-- 상단 유저 정보 -->
      <v-card-title class="user-header" >
        <v-avatar size="60"   @click="goToMypage">
          <img :src="profileImage" />
        </v-avatar>
        <div class="user-info">
            <div class="name-section">
                <div class="name" @click="goToMypage">{{ username }}</div>
                <button class="follow-btn" size="small">팔로우</button>
            </div>
          
          <div class="stats">
            게시글 <b>{{ posts }}</b> · 팔로워 <b>{{ followers }}</b> · 팔로우 <b>{{ followings }}</b>
          </div>
        </div>
      </v-card-title>
  
      <v-divider></v-divider>
  
      <!-- 오늘의 기록 -->
      <v-card-text class="section">
        <div class="section-header d-flex justify-space-between">
            <div class="section-title">오늘의 기록</div>
            <router-link to="/mypage" class="see-all">전체 기록 보기 →</router-link>
        </div>
  
        <div>
            <v-row dense v-for="(post, i) in todaysPosts" :key="i" class="post-item">
            <v-col cols="auto">
                <v-img :src="post.icon" class="marker-icon" width="32" height="32" contain></v-img>
            </v-col>
            <v-col>
                <div class="post-title">{{ post.title }}</div>
                <div class="post-location">
                {{ post.location }}
                </div>
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
          <router-link to="/mypage" class="see-all">스탬프 컬렉션 →</router-link>
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
        <div class="neighborhoods d-flex flex-wrap gap-2">
          <LocationChip
            v-for="(place, i) in neighborhoods"
            :key="i"
            :place="place"
          />
          <v-chip size="small" class="muted" color="grey">+ 6</v-chip>
        </div>

      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import {useRouter} from 'vue-router';
  import profileImage from '@/assets/profile/profile.png'
  import stampDummy from '@/assets/stamp_pic/독서냥.png'
  import LocationChip from '@/components/common/LocationChip.vue'
  
  const router = useRouter(); 
  const username = 'Madara Uchiha'
  const posts = 10
  const followers = 600
  const followings = 600

  const maxBadgesToShow = 5
  
  
  const todaysPosts = [
    {
      icon: stampDummy,
      title: '신대방동 돈까스 투어',
      location: '신대방동 294',
      time: '6시간 전'
    },
    {
      icon: stampDummy,
      title: '신대방동 돈까스 투어',
      location: '신대방동 294',
      time: '6시간 전'
    }
  ]
  // 뱃지 전체 목록 
  const badges = [
    stampDummy, stampDummy, stampDummy, stampDummy, stampDummy, stampDummy, stampDummy
  ]
  const displayedBadges = badges.slice(0, maxBadgesToShow)    // 최대 5개만 보이도록 
  const hiddenBadgeCount = badges.length - maxBadgesToShow   
  
  // 발견한 동네 목록 
  const neighborhoods = [
    { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
    { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 }
  ]


  const goToStamp = () => {
    router.push('/stamp')
  }
  const goToMypage = () => {
    router.push('/mypage')
  }
  </script>
  
  <style scoped>
/* 전체 카드 컨테이너 */
.user-card {
  width: 370px;
  padding: 20px 10px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  overflow: hidden;
}

/* ───── 상단 유저 정보 ───── */
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
}

.stats {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
}

/* ───── 공통 섹션 ───── */
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

/* ───── 오늘의 기록 ───── */
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

/* ───── 스탬프 / 아바타 ───── */
.badge-row {
  gap: 8px;
  align-items: center;
}
.badge-row img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  cursor: pointer;
}

/* ───── 동네 / LocationChip ───── */
.neighborhoods {
  margin-top: 8px;
  gap: 10px;
  display: flex;
  flex-wrap: wrap;
}

.muted {
  color: #777;
}

  </style>
  