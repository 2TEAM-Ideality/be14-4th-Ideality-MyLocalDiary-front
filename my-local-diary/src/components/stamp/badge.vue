<template>
    <div class="badge-wrapper">
      <div class="badge-list">
        <div
          v-for="(badge, index) in badges"
          :key="index"
          class="badge-item"
        >
          <img :src="badge.img" alt="badge" />
        </div>
      </div>
      <!-- 버튼 없앰 -->
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const badges = ref([
    { img: '/src/assets/badge/꽐라냥뱃지.png' },
    { img: '/src/assets/badge/독서냥뱃지.png' },
    { img: '/src/assets/badge/맛집냥뱃지.png' },
    { img: '/src/assets/badge/산책냥뱃지.png' },
    { img: '/src/assets/badge/영화냥뱃지.png' },
    { img: '/src/assets/badge/카페인냥뱃지.png' },
  ])
  </script>
  
  <style scoped>
  .badge-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .badge-list {
    display: flex;
    flex-wrap: wrap; /* ⭐ 줄 넘어갈 수 있게 */
    justify-content: center;
    gap: 16px;
    max-width: 500px; /* 필요하면 너비 제한 */
  }
  
  .badge-item img {
    width: auto;
    height: 160px; /* 높이만 고정 */
    object-fit: cover;
  }
  </style>
  