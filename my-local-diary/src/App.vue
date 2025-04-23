<template>
  <VApp>
    <VMain>
      <!-- 경로 따라 사이드바 조건부 렌더링 -->
      <Sidebar v-if="route.path !== '/'" />
      <RouterView />
    </VMain>
  </VApp>
</template>


<script setup>
import Sidebar from './components/common/Sidebar.vue'
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<style scoped>
</style>
