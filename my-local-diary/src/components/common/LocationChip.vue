<template>
    <v-chip
      prepend-icon="mdi-map-marker"
      variant="flat"
      size="small"
      class="chip-container"
    >
      {{ typeof place === 'string' ? place : place.name }}
    </v-chip>
</template>
  
<script setup>
  const props = defineProps({
    place: {
      type: Object,
      required: true,
      default: () => ({
        name: '',   // 장소명
        latitude: 0,   // 위도
        longitude: 0,  // 경도
      }),
    },
  })

</script>
  
  
<style scoped>
  .chip-container {
    cursor: pointer;
    background-color: #F5F5F5 !important;
    border: 1px solid #EDEDED;
    color: #2C2C2C;
  }
  
  ::v-deep(.v-icon) {
    color: #8E8E8E !important;
  }
</style>
  