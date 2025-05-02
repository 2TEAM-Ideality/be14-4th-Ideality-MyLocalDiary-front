<template>
  <VApp>
    <Sidebar v-if="route.path !== '/'" />
    <VMain class="main-content">
      <SSEConnect /> 
      <RouterView />
    </VMain>
  </VApp>
</template>

<script setup>
import Sidebar from './components/common/Sidebar.vue'
import SSEConnect from './components/common/SSEconnect.vue'
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { decodeJwt } from 'jose'
import { onMounted } from 'vue' // ✅ 이거 반드시 필요함

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 👇 강제 로그아웃 감시
watch(() => userStore.forcedLogout, (val) => {
  if (val) {
    alert('세션이 만료되어 로그아웃되었습니다.')
    router.push('/')
  }
})

onMounted(() => {
  setInterval(async () => {
    if (!userStore.token) return

    try {
      const decoded = decodeJwt(userStore.token)
      const now = Math.floor(Date.now() / 1000)
      const remaining = decoded.exp - now

      if (remaining <= 60) {
        const success = await userStore.tryReissueToken()
        if (!success) {
          userStore.forceLogout()
          router.push('/')  // 로그인 페이지로 이동
        }
      }
    } catch (e) {
      console.error('❌ JWT 디코딩 실패:', e)
      userStore.forceLogout()
      router.push('/')  // 토큰 손상 시에도 로그인 페이지 이동
    }
  }, 30000)
})
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
