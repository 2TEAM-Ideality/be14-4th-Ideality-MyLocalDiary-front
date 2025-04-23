<template>
    <v-card class="user-card">
      <!-- 상단 유저 정보 -->
      <v-card-title class="user-header">
        <v-avatar size="60">
          <img :src="profileImage" />
        </v-avatar>
        <div class="user-info">
          <div class="name">{{ username }}</div>
          <v-btn class="follow-btn" size="small" color="primary">팔로우</v-btn>
          <div class="stats">
            게시글 <b>{{ posts }}</b> · 팔로워 <b>{{ followers }}</b> · 팔로우 <b>{{ followings }}</b>
          </div>
        </div>
      </v-card-title>
  
      <v-divider></v-divider>
  
      <!-- 오늘의 기록 -->
      <v-card-text class="section">
        <div class="section-header d-flex justify-space-between">
          <span>오늘의 기록</span>
          <span class="see-all">전체 기록 보기 →</span>
        </div>
  
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
      </v-card-text>
  
      <!-- 뱃지 -->
      <v-card-text class="section">
        <div class="section-title">발자국을 남긴 곳</div>
        <div class="badge-row d-flex gap-3">
          <v-avatar v-for="(badge, i) in badges" :key="i" size="48">
            <img :src="badge" />
          </v-avatar>
        </div>
      </v-card-text>
  
      <!-- 동네 -->
      <v-card-text class="section">
        <div class="section-title">발견한 동네</div>
        <div class="neighborhoods d-flex flex-wrap gap-2">
          <v-chip v-for="(place, i) in neighborhoods" :key="i" size="small" color="grey-lighten-3">
            {{ place }}
          </v-chip>
          <v-chip size="small" class="muted" color="grey">+ 6</v-chip>
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import profileImage from '@/assets/profile/profile.png'
  
  const username = 'Madara Uchiha'
  const posts = 10
  const followers = 600
  const followings = 600
  
  const todaysPosts = [
    {
      icon: '/src/assets/markers/food.png',
      title: '신대방동 돈까스 투어',
      location: '신대방동 294',
      time: '6시간 전'
    },
    {
      icon: '/src/assets/markers/food.png',
      title: '신대방동 돈까스 투어',
      location: '신대방동 294',
      time: '6시간 전'
    }
  ]
  
  const badges = [
    '/src/assets/badges/paw.png',
    '/src/assets/badges/cat.png'
  ]
  
  const neighborhoods = ['신대방동 294', '보라매로 73']
  </script>
  
  <style scoped>
  .user-card {
    width: 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: sans-serif;
    overflow: hidden;
  }
  .user-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .user-info .name {
    font-size: 18px;
    font-weight: 600;
  }
  .follow-btn {
    margin-top: 6px;
    font-size: 12px;
  }
  .stats {
    font-size: 12px;
    color: #555;
    margin-top: 4px;
  }
  .section {
    margin-top: 12px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .post-title {
    font-weight: 600;
    font-size: 14px;
  }
  .post-location {
    font-size: 12px;
    color: #777;
  }
  .badge-row {
    margin-top: 6px;
  }
  .neighborhoods {
    margin-top: 8px;
  }
  .muted {
    color: #777;
  }
  </style>
  