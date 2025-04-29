<script setup>
import { defineProps } from 'vue'
import profileImageDummy from '@/assets/profile/profile.png'

const props = defineProps({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  userImage: {
    type: String,
    default: profileImageDummy
    },                                                                  
  map: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

function goToUserHome() {
  const latlng = new naver.maps.LatLng(props.lat, props.lng)
  props.map.setCenter(latlng)
  props.map.setZoom(15)
}
</script>

<template>
  <div
    class="floating-user"
    :style="{ top: `${24 + index * 72}px` }"
    @click="goToUserHome"
  >
    <img :src="userImage" alt="User Icon" />
  </div>
</template>

<style scoped>
.floating-user {
  position: absolute;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: top 0.2s ease;
}

.floating-user img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
