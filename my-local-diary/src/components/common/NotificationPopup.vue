<template>
  <div v-if="isOpen" class="notification-popup">
    <div class="header">
      <h2>알림</h2>
      <button class="close-btn" @click="emit('close')">X</button>
    </div>
    <div class="content">
      <div 
        v-for="n in notifications" 
        :key="n.id" 
        class="notification-item"
        :class="{ unread: !n.isRead }"
        @click="handleNotificationClick(n.id, n.targetId)"
      >
        <strong>{{ n.nickname }}</strong>{{ n.action }}
        <div class="timestamp">{{ formatDate(n.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  isOpen: Boolean,
  notifications: Array
})

const emit = defineEmits(['close'])
const router = useRouter()

const handleNotificationClick = async (id, targetId) => {
  const noti = props.notifications.find(n => n.id === id)
  if (noti) {
    noti.isRead = true

    try {
      const token = localStorage.getItem('access_token')
      await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('읽음 처리 실패:', error)
    }

    router.push(`/profile/${targetId}`)
    emit('close')
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
  left: 0; /* 🔥 왼쪽 고정 */
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
  background-color: #e7f3ff; /* 🔥 읽지 않은 알림은 연한 파랑 배경 */
  font-weight: bold;
}

.timestamp {
  font-size: 12px;
  color: gray;
  margin-top: 4px;
}
</style>
