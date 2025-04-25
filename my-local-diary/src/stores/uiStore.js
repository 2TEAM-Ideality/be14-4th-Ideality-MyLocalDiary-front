// src/stores/uiStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isHover = ref(false)
  const showText = ref(false)
  const showImage = ref(false)

  const hoverSidebar = () => {
    isHover.value = true
    setTimeout(() => {
      showText.value = true
      showImage.value = true
    }, 250)
  }

  const leaveSidebar = () => {
    isHover.value = false
    showText.value = false
    showImage.value = false
  }

  return {
    isHover,
    showText,
    showImage,
    hoverSidebar,
    leaveSidebar,
  }
})
