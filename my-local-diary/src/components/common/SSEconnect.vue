<template>
  <div></div> <!-- UI 요소는 없어도 됨 -->
</template>
<script setup>
import { watch } from 'vue'
import { onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
let eventSource = null

watch(
  () => userStore.token,
  (token) => {
    if (!token) {
      console.warn('⏳ accessToken 없음. SSE 연결 대기 중')
      return
    }

    if (eventSource) {
      console.log('⚠️ SSE 이미 연결됨')
      return
    }

    console.log('📡 SSE 연결 시도...')
    eventSource = new EventSource(`http://localhost:8080/api/follow/stream?token=${token}`)

    eventSource.addEventListener('connect', (event) => {
      console.log('✅ SSE 연결 성공:', event.data)
    })

    eventSource.addEventListener('follow', (event) => {
      console.log('🔔 팔로우 알림 도착:', event.data)
    })

    eventSource.onerror = (error) => {
      console.error('❌ SSE 연결 에러:', error)
      eventSource.close()
      eventSource = null
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close()
    console.log('👋 SSE 연결 종료')
  }
})
</script>

<style scoped>
/* 스타일은 필요 없으면 비워두자 */
</style>
