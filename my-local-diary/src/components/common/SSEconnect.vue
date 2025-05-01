<script setup>
import { watch } from 'vue'
import { onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore' // 추가

const userStore = useUserStore()
const notificationStore = useNotificationStore() // store 인스턴스

let eventSource = null

watch(
  () => userStore.token,
  (token) => {
    if (!token) return
    if (eventSource) return

    console.log('📡 SSE 연결 시도...')
    eventSource = new EventSource(`http://localhost:8080/api/follow/stream?token=${token}`)

    eventSource.addEventListener('connect', (event) => {
      console.log('✅ SSE 연결 성공:', event.data)
    })

    eventSource.addEventListener('follow', (event) => {
      const noti = JSON.parse(event.data) // ← 백엔드에서 보낸 Notification 객체
      console.log('🔔 팔로우 알림 도착:', noti)

+     notificationStore.addNotification(noti) // 🟢 알림 store에 추가!
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
