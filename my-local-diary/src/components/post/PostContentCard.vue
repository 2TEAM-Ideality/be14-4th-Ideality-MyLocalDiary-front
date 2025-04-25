<template>
  <v-card flat class="pa-3">
    <div class="text-body-1" style="white-space: pre-line">{{ content }}</div>

  </v-card>
</template>

<script setup>
import { computed } from 'vue'
  defineProps({
    postType: String,
    content: String,
  })
  const postTypeLabel = computed(() => {
    return postType === 'post' ? 'Post' : 'Diary'
  })
</script>
