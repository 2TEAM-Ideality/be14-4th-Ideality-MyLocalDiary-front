<template>
    <div class="floating-user-list">
    <FloatingUser
        v-for="(user, index) in users"
        :key="user.id"
        :lat="user.lat"
        :lng="user.lng"
        :userImage="user.image"
        :map="map"
        :index="index" 
    />
    </div>
  </template>
        <!-- :userImage="user.image" -->

  
  <script setup>
  import FloatingUser from './FloatingUser.vue'
  import defaultImage from '@/assets/profile/profile.png'
  
  const props = defineProps({
    users: {
      type: Array,
      required: true
    },
    map: {
      type: Object,
      required: true
    }
  })

  onMounted(() => {
    console.log('[🧭 유저 수]:', users.length)
    console.log('[🗺️ map 객체 상태]:', map)
    })
  </script>
  
  <style scoped>
  .floating-user-list {
    position: absolute;
    top: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 1000;
  }
  </style>
  