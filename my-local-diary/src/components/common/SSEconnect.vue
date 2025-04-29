<template>
  <div></div> <!-- UI 요소는 없어도 됨 -->
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

let eventSource = null

onMounted(() => {
  const token = localStorage.getItem('accessToken') // ✅ localStorage에서 토큰 가져오기

  if (!token) {
    console.error('❌ accessToken이 없습니다. SSE 연결 불가')
    return
  }

  eventSource = new EventSource(`http://localhost:8080/api/follow/stream?token=${token}`)

  eventSource.addEventListener('connect', (event) => {
    console.log('✅ SSE 연결 성공:', event.data)
  })

  eventSource.addEventListener('follow', (event) => {
    console.log('🔔 팔로우 알림 도착:', event.data)
    // 👉 필요시 이곳에서 UI로 알림 띄우기
  })

  eventSource.onerror = (error) => {
    console.error('❌ SSE 연결 에러:', error)
    eventSource.close()
  }
})

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close()
    console.log('SSE 연결 종료')
  }
})
</script>

<style scoped>
/* 스타일은 필요 없으면 비워두자 */
</style>
