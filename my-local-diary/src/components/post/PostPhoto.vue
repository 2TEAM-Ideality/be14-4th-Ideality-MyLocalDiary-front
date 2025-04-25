<template>
  <v-container class="d-flex flex-column justify-center align-center" style="height: 100vh;">
    <div class="d-flex align-center justify-center" style="height: 100vh; width: 100vh;">
      <v-btn icon @click="prevImage" :style="{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <v-img
        :src="currentImage?.url"
        max-width="960"
        max-height="960"
        class="mx-4"
        contain
      />

      <v-btn icon @click="nextImage" :style="{ visibility: currentIndex === images.length - 1 ? 'hidden' : 'visible' }">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
    <div class="d-flex justify-center mt-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        @click="goToImage(index)"
        :class="['dot', { active: index === currentIndex }]"
      />
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
})

const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

const prevImage = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) currentIndex.value++
}

const goToImage = (index) => {
  currentIndex.value = index
}
</script>

<style scoped>
  .dot-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
  }

  .dot {
    width: 14px;
    height: 14px;
    margin: 0 6px;
    border-radius: 50%;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.3s;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); /* 그림자 효과 */
  }

  .dot.active {
    background-color: #666;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 활성 dot 더 진한 그림자 */
  }
</style>