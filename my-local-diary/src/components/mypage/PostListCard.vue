<template>
    <div class="pt-2 pb-2  container">
      <!-- 썸네일 이미지 -->
        <div class="image-wrapper">
        <img 
            :src="post.thumbnailImage"   
            width="50"
            height="50"
            style="display: inline-block; vertical-align: middle; margin-right: 5px; border-radius: 50%; border: 2px solid black"
        />
        </div>
      <!-- 텍스트 및 칩 -->
      <div style="display: inline-block; vertical-align: middle; width: calc(100% - 55px);">
        <!-- 제목 -->
        <div class="text-lg font-semibold">
          {{ post.postTitle }}
        </div>
  
        <!-- 장소와 날짜 -->
        <div class="d-flex" style="justify-content: space-between; align-items: center; width: 100%">
          <div class="d-flex gap-2">
            <LocationChip :place="{ name: post.placeName }" />
          </div>
          <div style="font-size: 12px; color: gray">
            {{ formattedDate }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import LocationChip from '../common/LocationChip.vue'
  import { computed } from 'vue'
  
  const props = defineProps({
    post: {
      type: Object,
      required: true
    }
  })
  
  // createdAt을 YYYY.MM.DD 형식으로 포맷팅
  const formattedDate = computed(() => {
    if (!props.post.createdAt) return '-'
    const date = new Date(props.post.createdAt)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}.${mm}.${dd}`
  })
  </script>
  
  <style scoped>

  .container {
    display:flex;
    flex-direction: row;
    gap: 10px;
  }


  </style>
  