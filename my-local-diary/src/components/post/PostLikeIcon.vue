<template>
    <div class="d-flex align-center">
      <v-img
        :src="likedByCurrentUser ? likedIcon : defaultIcon"
        width="32"
        height="32"
        @click="handleClick"
        class="like-icon"
      />
    </div>
    <div>{{ likeCount }}</div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    likedByCurrentUser: Boolean,
    likeCount: Number,
  })
  
  const emit = defineEmits(['toggle'])
  
  const defaultIcon = new URL('@/assets/icons/fish_default.png', import.meta.url).href
  const likedIcon = new URL('@/assets/icons/fish_liked.png', import.meta.url).href
  
  const handleClick = () => {
    emit('toggle')
  }
  </script>
  
  <style scoped>
  .like-icon {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .like-icon:hover {
    transform: scale(1.1);
  }
  </style>
  