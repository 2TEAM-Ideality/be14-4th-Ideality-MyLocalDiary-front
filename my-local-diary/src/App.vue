<template>
  <VApp>
    <Sidebar v-if="route.path !== '/'" />
    <VMain class="main-content">
      <RouterView />
    </VMain>
  </VApp>
</template>

<script setup>
import Sidebar from './components/common/Sidebar.vue'
import { useRoute } from 'vue-router'


const route = useRoute()
</script>

<style scoped>
/* Vuetify 기본 margin 제거 */
:deep(.v-application--wrap) {
  margin-left: 0 !important;
}

:deep(.v-main) {
  padding-left: 0 !important;
  margin-left: 0 !important;
  transition: none !important;
}

/* 필요한 경우 내부 컨텐츠도 고정 */
.main-content {
  width: 100%;
  max-width: 100%;
}
</style>
