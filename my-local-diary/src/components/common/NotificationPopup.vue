<template>
  <div v-if="isOpen" class="notification-popup">
    <div class="header">
      <h2>알림</h2>
      <button class="close-btn" @click="emit('close')">X</button>
    </div>
    <div class="content">
      <div 
        v-for="n in notificationStore.notifications" 
        :key="n.id" 
        class="notification-item"
        :class="{ unread: !n.read }"
      >
        <!-- 📌 알림 내용 클릭 시 읽음 + 이동 -->
        <div @click="handleNotificationClick(n.id, n.targetId)">
          <strong>{{ n.content }}</strong>
          <div class="timestamp">{{ formatDate(n.createdAt) }}</div>
        </div>

        <!-- ✅ 수락 버튼: 팔로우 요청일 경우에만 표시 -->
        <button
  v-if="n.type === 'FOLLOW' && n.content.includes('요청') && !n.accepted"
  class="accept-btn"
  @click="() => acceptRequest(n)"
>
  수락
</button>


<!-- ✅ 거절 버튼 추가 -->
<button
  v-if="n.type === 'FOLLOW' && n.content.includes('요청') && !n.accepted"
  class="reject-btn"
  @click="() => rejectRequest(n)"
>
  거절
</button>


      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])
const router = useRouter()
const notificationStore = useNotificationStore()
const userStore = useUserStore();


const handleNotificationClick = async (id, targetId) => {
  try {
    await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    notificationStore.markAsRead(id)
    router.push(`/mypage/${targetId}`)
    emit('close')
  } catch (error) {
    console.error('읽음 처리 실패:', error)
  }
}

// ✅ 팔로우 요청 수락
const acceptRequest = async (n) => {
  try {
    await axios.patch('http://localhost:8080/api/follow/accept', {
      followingMemberId: n.targetId,
      followTargetMemberId: userStore.id
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })



    notificationStore.notifications = notificationStore.notifications.filter(
  noti => noti.id !== n.id
)


  } catch (err) {
    console.error('팔로우 요청 수락 실패:', err)
  }
}

const rejectRequest = async (n) => {
  try {
    await axios.delete('http://localhost:8080/api/follow/reject', {
      headers: { Authorization: `Bearer ${userStore.token}` },
      data: {
        followingMemberId: n.targetId,
        followTargetMemberId: userStore.id
      }
    })

    // 알림 목록에서 제거하거나 상태 업데이트
    notificationStore.notifications = notificationStore.notifications.filter(
      noti => noti.id !== n.id
    )
  } catch (err) {
    console.error('팔로우 요청 거절 실패:', err)
  }
}



const formatDate = (datetime) => {
  return datetime.split('T')[0] + ' ' + (datetime.split('T')[1] || '')
}
</script>

<style scoped>
.notification-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 350px;
  height: 100%;
  background-color: white;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1200;
  overflow-y: auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.content {
  display: flex;
  flex-direction: column;
}
.notification-item {
  background: white;
  padding: 15px 20px;
  margin-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
  cursor: pointer;
}
.notification-item.unread {
  background-color: #e7f3ff;
  font-weight: bold;
}
.timestamp {
  font-size: 12px;
  color: gray;
  margin-top: 4px;
}
.accept-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}
.reject-btn {
  margin-top: 8px;
  margin-left: 8px;
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

</style>
