<template>
  <v-card flat>
    <div class="text-body-1" style="white-space: pre-line">{{ content }}</div>

  </v-card>
</template>

<script setup>
  defineProps({
    content: String,
  })
</script>
