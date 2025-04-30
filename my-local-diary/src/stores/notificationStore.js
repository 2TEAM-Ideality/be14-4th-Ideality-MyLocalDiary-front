// src/stores/notificationStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  async function fetchNotifications(token) {
    try {
      const res = await axios.get('http://localhost:8080/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log('📦 알림 불러오기 성공:', res.data)
      notifications.value = res.data // ✅ 배열이니까 그대로 저장
    } catch (err) {
      console.error('❌ 알림 불러오기 실패:', err)
    }
  }

  function markAsRead(id) {
    const target = notifications.value.find(n => n.id === id)
    if (target) target.isRead = true
  }

  // ❗❗ 이 부분이 중요
  return {
    notifications,
    fetchNotifications,
    markAsRead
  }
})
