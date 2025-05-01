<template>
  <v-container class="d-flex flex-column justify-center align-center">
    <div class="d-flex align-center justify-center">
      <div class="image-box" style="display: flex; width: 450px; height: 450px; align-items: center; justify-content: center;">
        <div class="image-container" style="position: relative; display: inline-flex;">
          <img
            ref="imageEl"
            :src="currentImage?.url"
            class="display-image"
            style="object-fit: contain;"
            @load="onImageLoad"
            @error="handleImageError"
            v-show="visible"
          />
          <div
            class="nav-zone left"
            v-if="currentIndex > 0"
            @click="prevImage"
            @mouseenter="hoverLeft = true"
            @mouseleave="hoverLeft = false"
            :style="{
              pointerEvents: currentIndex > 0 ? 'auto' : 'none'
            }"
          >
            <v-icon v-if="hoverLeft && currentIndex > 0">mdi-chevron-left</v-icon>
          </div>
          <div
            class="nav-zone right"
            @click="nextImage"
            @mouseenter="hoverRight = true"
            @mouseleave="hoverRight = false"
            :style="{ pointerEvents: currentIndex < images.length - 1 ? 'auto' : 'none' }"
          >
            <v-icon v-if="hoverRight && currentIndex < images.length - 1">mdi-chevron-right</v-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-center mt-2">
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

  const hoverLeft = ref(false)
  const hoverRight = ref(false)

  const props = defineProps({
    images: {
      type: Array,
      required: true,
    },
  })

  console.log(props.images)
  const currentIndex = ref(0)
  const currentImage = computed(() => props.images[currentIndex.value])

  const prevImage = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  const nextImage = () => {
    if (currentIndex.value < props.images.length - 1) {
      currentIndex.value++
    }
  }

  const goToImage = (index) => {
    currentIndex.value = index
  }

  const imageEl = ref(null)
  const visible = ref(true) 
  const onImageLoad = () => {
    visible.value = false
    hoverLeft.value = false;
    hoverRight.value = false;
    const img = imageEl.value
    if (!img) return

    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight

    if (naturalWidth > naturalHeight) {
      // 가로가 더 길다 → 가로를 450에 맞춘다
      img.style.width = '450px'
      img.style.height = 'auto'
    } else {
      // 세로가 더 길거나 같다 → 세로를 450에 맞춘다
      img.style.height = '450px'
      img.style.width = 'auto'
    }
    visible.value = true
  }


  const handleImageError = () => {
    console.error('이미지 로딩 실패:', currentImage?.url);
    visible.value = false;
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

  .nav-zone {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s;
  z-index: 10;
}

.nav-zone.left {
  left: 0px;
}

.nav-zone.right {
  right: 0px;
}

.nav-zone:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.v-icon {
  font-size: 36px;
}
</style>